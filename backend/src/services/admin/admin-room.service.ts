import fs from 'fs';
import path from 'path';
import { Team } from '../../models/Team';

const DEFAULT_ROOMS = { '1': 'Salle 1', '2': 'Salle 2', '3': 'Salle 3', '4': 'Salle 4' };

export class AdminRoomService {
  private getRoomsFilePath(): string {
    return path.join(__dirname, '../../../data/rooms.json');
  }

  private ensureDataDir(): void {
    const dataDir = path.dirname(this.getRoomsFilePath());
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async getRoomNames(): Promise<Record<string, string>> {
    const roomsFile = this.getRoomsFilePath();

    if (!fs.existsSync(roomsFile)) {
      this.ensureDataDir();
      fs.writeFileSync(roomsFile, JSON.stringify(DEFAULT_ROOMS, null, 2));
      return DEFAULT_ROOMS;
    }

    return JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
  }

  async updateRoomName(roomNumber: string, name: string): Promise<void> {
    this.ensureDataDir();
    const roomsFile = this.getRoomsFilePath();

    let rooms: Record<string, string> = {};
    if (fs.existsSync(roomsFile)) {
      rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
    }

    rooms[roomNumber] = name;
    fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));
  }

  async addRoom(): Promise<{ id: number; name: string }> {
    this.ensureDataDir();
    const roomsFile = this.getRoomsFilePath();

    let rooms: Record<string, string> = {};
    if (fs.existsSync(roomsFile)) {
      rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
    }

    const existingIds = Object.keys(rooms).map(Number);
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    rooms[nextId.toString()] = `Salle ${nextId}`;
    fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));

    return { id: nextId, name: rooms[nextId.toString()] };
  }

  async deleteRoom(roomNumber: string): Promise<boolean> {
    const roomsFile = this.getRoomsFilePath();

    if (!fs.existsSync(roomsFile)) return false;

    const rooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
    if (!rooms[roomNumber]) return false;

    delete rooms[roomNumber];
    fs.writeFileSync(roomsFile, JSON.stringify(rooms, null, 2));

    await Team.update({ roomNumber: null }, { where: { roomNumber: parseInt(roomNumber) } });
    return true;
  }

  async assignRooms(assignments: Array<{ teamId: string; roomNumber: number }>): Promise<void> {
    for (const { teamId, roomNumber } of assignments) {
      await Team.update(
        { roomNumber: roomNumber === 0 ? null : roomNumber },
        { where: { id: teamId } }
      );
    }
  }
}

export default new AdminRoomService();
