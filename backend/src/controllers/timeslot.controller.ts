import { Response } from 'express';
import { TimeSlot } from '../models/TimeSlot';
import { Team } from '../models/Team';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export class TimeSlotController {
    // Get all available time slots with team count
    async getAvailableTimeSlots(req: AuthRequest, res: Response): Promise<void> {
        try {
            const timeSlots = await TimeSlot.findAll({
                where: { isActive: true },
                order: [['startTime', 'ASC']],
            });

            const timeSlotsWithCount = await Promise.all(
                timeSlots.map(async (slot) => {
                    const teamCount = await slot.getTeamCount();
                    return {
                        id: slot.id,
                        roomName: slot.roomName,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        maxTeams: slot.maxTeams,
                        teamCount,
                        isFull: teamCount >= slot.maxTeams,
                        displayName: slot.getDisplayName(),
                    };
                })
            );

            res.json({
                success: true,
                data: { timeSlots: timeSlotsWithCount },
            });
        } catch (error) {
            logger.error('Get available time slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des créneaux horaires.',
            });
        }
    }

    // Get all time slots for admin (including inactive ones)
    async getAllTimeSlots(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.isAdmin) {
                res.status(403).json({ success: false, message: 'Accès refusé.' });
                return;
            }

            const timeSlots = await TimeSlot.findAll({
                order: [['startTime', 'ASC']],
            });

            const timeSlotsWithCount = await Promise.all(
                timeSlots.map(async (slot) => {
                    const teamCount = await slot.getTeamCount();
                    return {
                        id: slot.id,
                        roomName: slot.roomName,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        maxTeams: slot.maxTeams,
                        isActive: slot.isActive,
                        teamCount,
                        isFull: teamCount >= slot.maxTeams,
                        displayName: slot.getDisplayName(),
                    };
                })
            );

            res.json({
                success: true,
                data: { timeSlots: timeSlotsWithCount },
            });
        } catch (error) {
            logger.error('Get all time slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des créneaux horaires.',
            });
        }
    }

    // Create a new time slot (admin only)
    async createTimeSlot(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.isAdmin) {
                res.status(403).json({ success: false, message: 'Accès refusé.' });
                return;
            }

            const { roomName, startTime, endTime, maxTeams } = req.body;

            const timeSlot = await TimeSlot.create({
                roomName,
                startTime,
                endTime,
                maxTeams: maxTeams || 6,
                isActive: true,
            });

            logger.info(`Time slot created: ${timeSlot.getDisplayName()} by ${req.user.email}`);

            res.status(201).json({
                success: true,
                message: 'Créneau horaire créé avec succès.',
                data: { timeSlot },
            });
        } catch (error) {
            logger.error('Create time slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du créneau horaire.',
            });
        }
    }

    // Update a time slot (admin only)
    async updateTimeSlot(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.isAdmin) {
                res.status(403).json({ success: false, message: 'Accès refusé.' });
                return;
            }

            const { id } = req.params;
            const { roomName, startTime, endTime, maxTeams, isActive } = req.body;

            const timeSlot = await TimeSlot.findByPk(id);
            if (!timeSlot) {
                res.status(404).json({ success: false, message: 'Créneau horaire non trouvé.' });
                return;
            }

            if (roomName !== undefined) timeSlot.roomName = roomName;
            if (startTime !== undefined) timeSlot.startTime = startTime;
            if (endTime !== undefined) timeSlot.endTime = endTime;
            if (maxTeams !== undefined) timeSlot.maxTeams = maxTeams;
            if (isActive !== undefined) timeSlot.isActive = isActive;

            await timeSlot.save();

            logger.info(`Time slot updated: ${timeSlot.getDisplayName()} by ${req.user.email}`);

            res.json({
                success: true,
                message: 'Créneau horaire mis à jour avec succès.',
                data: { timeSlot },
            });
        } catch (error) {
            logger.error('Update time slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du créneau horaire.',
            });
        }
    }

    // Delete a time slot (admin only)
    async deleteTimeSlot(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.isAdmin) {
                res.status(403).json({ success: false, message: 'Accès refusé.' });
                return;
            }

            const { id } = req.params;

            const timeSlot = await TimeSlot.findByPk(id);
            if (!timeSlot) {
                res.status(404).json({ success: false, message: 'Créneau horaire non trouvé.' });
                return;
            }

            // Unassign all teams from this time slot
            await Team.update({ timeSlotId: null }, { where: { timeSlotId: id } });

            const displayName = timeSlot.getDisplayName();
            await timeSlot.destroy();

            logger.info(`Time slot deleted: ${displayName} by ${req.user.email}`);

            res.json({
                success: true,
                message: 'Créneau horaire supprimé avec succès.',
            });
        } catch (error) {
            logger.error('Delete time slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du créneau horaire.',
            });
        }
    }
}

export default new TimeSlotController();
