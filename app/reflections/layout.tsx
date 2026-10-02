import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';
import styles from './reflections-room.module.css';

export default function ReflectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.room}>
      <HouseRoomThreshold room="REFLECTIONS" />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
