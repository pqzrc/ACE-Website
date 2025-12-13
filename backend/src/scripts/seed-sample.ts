import 'dotenv/config';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration, RegistrationStatus } from '../models/Registration';
import { TimeSlot } from '../models/TimeSlot';
import ctfdService from '../services/ctfd.service';

const PASSWORD = 'Password123!';
const SYNC_CTFD = process.argv.includes('--sync-ctfd');

async function main() {
  await connectDatabase();

  logger.info('Cleaning existing data (non-admin users, teams, registrations)...');
  await Registration.destroy({ where: {} });
  await Team.destroy({ where: {} });
  await User.destroy({ where: { isAdmin: false } });

  // Ensure some timeslots exist
  let timeSlots = await TimeSlot.findAll();
  if (timeSlots.length === 0) {
    timeSlots = await TimeSlot.bulkCreate([
      { roomName: 'H0', startTime: '13:00', endTime: '14:00', maxTeams: 6, isActive: true },
      { roomName: 'H1', startTime: '14:00', endTime: '15:00', maxTeams: 6, isActive: true },
      { roomName: 'H2', startTime: '15:00', endTime: '16:00', maxTeams: 6, isActive: true },
    ]);
    logger.info('Created default timeslots H0, H1, H2');
  }

  const makeUser = (index: number) => ({
    firstName: `User${index + 1}`,
    lastName: 'Sample',
    email: `user${index + 1}@example.com`,
    password: PASSWORD,
    emailVerified: true,
    composante: 'IUT',
    specialty: 'Cyber',
    phoneNumber: null,
    username: `user${index + 1}`,
    teamId: null,
  });

  logger.info('Creating 60 verified users...');
  const users = await User.bulkCreate(Array.from({ length: 60 }, (_, i) => makeUser(i)));

  // Helper to pick users and remove from pool
  const pool = [...users];
  const takeUsers = (count: number) => pool.splice(0, count);

  // Create full teams (5 members) - captain is first member
  const createdFullTeams: Team[] = [];
  for (let i = 0; i < 8; i++) {
    const members = takeUsers(5);
    const captain = members[0];

    const team = await Team.create({
      name: `TeamFull-${i + 1}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      isComplete: true,
      currentScore: 0,
      roomNumber: null as number | null,
      timeSlotId: timeSlots[i % timeSlots.length].id,
      captainId: captain.id,
    });

    await Promise.all(members.map((m) => m.update({ teamId: team.id })));
    await Promise.all(
      members.map((m) =>
        Registration.create({
          userId: m.id,
          teamId: team.id,
          status: RegistrationStatus.TEAM_COMPLETE,
          verifiedAt: new Date(),
        }),
      ),
    );
    createdFullTeams.push(team);
  }

  // Create incomplete teams (2-3 members)
  const createdIncompleteTeams: Team[] = [];
  for (let i = 0; i < 3; i++) {
    const memberCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const members = takeUsers(memberCount);
    const captain = members[0];

    const team = await Team.create({
      name: `TeamWIP-${i + 1}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      isComplete: false,
      currentScore: 0,
      roomNumber: null as number | null,
      timeSlotId: timeSlots[(i + 1) % timeSlots.length].id,
      captainId: captain.id,
    });

    await Promise.all(members.map((m) => m.update({ teamId: team.id })));
    await Promise.all(
      members.map((m) =>
        Registration.create({
          userId: m.id,
          teamId: team.id,
          status: RegistrationStatus.TEAM_INCOMPLETE,
          verifiedAt: new Date(),
        }),
      ),
    );
    createdIncompleteTeams.push(team);
  }

  // Remaining users: no team, but verified
  for (const user of pool) {
    await Registration.create({
      userId: user.id,
      teamId: null,
      status: RegistrationStatus.VERIFIED,
      verifiedAt: new Date(),
    });
  }

  logger.info('✅ Seed completed:');
  logger.info(` - Full teams (5/5): ${createdFullTeams.length}`);
  logger.info(` - Incomplete teams: ${createdIncompleteTeams.length}`);
  logger.info(` - Users without team: ${pool.length}`);

  // Optionally sync to CTFd
  if (SYNC_CTFD) {
    logger.info('🔄 Syncing teams to CTFd...');
    try {
      const result = await ctfdService.syncTeams();
      logger.info(`CTFd sync result: ${result.success} success, ${result.failed} failed`);
    } catch (error) {
      logger.error('CTFd sync failed:', error);
    }
  } else {
    logger.info('💡 Tip: Run with --sync-ctfd to sync teams to CTFd');
  }
}

main()
  .then(() => {
    logger.info('Done.');
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Seed error', err);
    process.exit(1);
  });

