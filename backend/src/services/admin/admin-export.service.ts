import { User } from '../../models/User';
import { Team } from '../../models/Team';
import { Registration } from '../../models/Registration';
import { TimeSlot } from '../../models/TimeSlot';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

const FIELD_LABELS: Record<string, string> = {
  firstName: 'Prénom',
  lastName: 'Nom',
  email: 'Email',
  phoneNumber: 'Téléphone',
  username: "Nom d'utilisateur",
  composante: 'Composante',
  specialty: 'Spécialité',
  emailVerified: 'Email vérifié',
  teamName: 'Équipe',
  teamRole: 'Rôle équipe',
  roomNumber: 'Salle',
  roomName: 'Nom salle',
  timeSlot: 'Créneau horaire',
  currentScore: 'Points',
  rank: 'Classement',
  registrationStatus: 'Statut inscription',
  createdAt: 'Date inscription',
};

export class AdminExportService {
  private getRoomsFilePath(): string {
    return path.join(__dirname, '../../../data/rooms.json');
  }

  private loadRoomNames(): Record<number, string> {
    try {
      const roomsFile = this.getRoomsFilePath();
      if (fs.existsSync(roomsFile)) {
        return JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
      }
    } catch (e) {
      logger.warn('Could not load rooms.json');
    }
    return {};
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  async exportSimpleCSV(): Promise<string> {
    const registrations = await Registration.findAll({
      include: [
        { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email', 'composante', 'specialty', 'emailVerified'] },
        { model: Team, as: 'team', attributes: ['name', 'roomNumber'] },
      ],
    });

    const header = 'Prénom,Nom,Email,Composante,Spécialité,Email Vérifié,Équipe,Salle,Statut\n';
    const rows = registrations.map((reg: any) => {
      const u = reg.user;
      const t = reg.team;
      return [
        u.firstName, u.lastName, u.email, u.composante || '', u.specialty || '',
        u.emailVerified ? 'Oui' : 'Non', t?.name || 'Aucune', t?.roomNumber || '', reg.status,
      ].join(',');
    }).join('\n');

    return header + rows;
  }

  async exportCustomCSV(fields: string[]): Promise<string> {
    const registrations = await Registration.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'username', 'composante', 'specialty', 'emailVerified', 'createdAt'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'captainId', 'roomNumber', 'currentScore', 'rank', 'timeSlotId'],
          include: [{ model: TimeSlot, as: 'timeSlot', attributes: ['roomName', 'startTime', 'endTime'], required: false }],
        },
      ],
    });

    const roomNames = this.loadRoomNames();
    const header = fields.map(f => FIELD_LABELS[f] || f).join(',') + '\n';

    const rows = registrations.map((reg: any) => {
      const u = reg.user;
      const t = reg.team;
      const ts = t?.timeSlot;

      return fields.map(field => {
        const value = this.getFieldValue(field, u, t, ts, reg, roomNames);
        return this.escapeCSV(String(value));
      }).join(',');
    }).join('\n');

    return '\uFEFF' + header + rows;
  }

  private getFieldValue(field: string, user: any, team: any, timeSlot: any, reg: any, roomNames: Record<number, string>): string {
    switch (field) {
      case 'firstName': return user?.firstName || '';
      case 'lastName': return user?.lastName || '';
      case 'email': return user?.email || '';
      case 'phoneNumber': return user?.phoneNumber || '';
      case 'username': return user?.username || '';
      case 'composante': return user?.composante || '';
      case 'specialty': return user?.specialty || '';
      case 'emailVerified': return user?.emailVerified ? 'Oui' : 'Non';
      case 'teamName': return team?.name || 'Aucune';
      case 'teamRole': return team?.captainId === user?.id ? 'Capitaine' : 'Membre';
      case 'roomNumber': return team?.roomNumber || '';
      case 'roomName': return team?.roomNumber ? (roomNames[team.roomNumber] || `Salle ${team.roomNumber}`) : '';
      case 'timeSlot': return timeSlot ? `Salle ${timeSlot.roomName} – ${timeSlot.startTime.substring(0, 5)}-${timeSlot.endTime.substring(0, 5)}` : '';
      case 'currentScore': return team?.currentScore || '0';
      case 'rank': return team?.rank || '';
      case 'registrationStatus': return reg.status || '';
      case 'createdAt': return user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '';
      default: return '';
    }
  }
}

export default new AdminExportService();
