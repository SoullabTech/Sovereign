import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold';
import styles from './journal-sanctum.module.css';

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.sanctum}>
      <HouseRoomThreshold room="JOURNAL" />
      <div className={styles.book} aria-label="Journal">
        {children}
      </div>
    </div>
  );
}
