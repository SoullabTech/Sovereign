The **Notification and Reminder System** has been fully integrated into the existing **Integrated Dashboard**. Let’s proceed to the next tool.

---

### Next Tool: **Habit Formation and Streak Tracking**

#### Core Features:

1. **Habit Creation**:
    
    - Users can define habits with recurrence patterns (daily, weekly, etc.).
2. **Streak Tracking**:
    
    - Track consecutive days or weeks of habit completion and notify users of streaks.
3. **Progress Visualization**:
    
    - Display streaks and completion rates through charts.
4. **Integration**:
    
    - Sync habit logs with goals, notifications, and other features.

---

Would you like to start with **Habit Creation** or **Streak Tracking**? Let me know!

import sqlite3
from datetime import datetime, timedelta

# Initialize database for habit tracking and streak tracking

def initialize_habit_tracking_database():
    connection = sqlite3.connect('habit_tracking.db')
    cursor = connection.cursor()

    # Create table for habits
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            habit_name TEXT NOT NULL,
            description TEXT,
            recurrence TEXT NOT NULL, -- daily, weekly, etc.
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create table for habit logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            log_date DATE NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')

    connection.commit()
    connection.close()

# Add a new habit
def add_habit(username, habit_name, description, recurrence):
    connection = sqlite3.connect('habit_tracking.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO habits (username, habit_name, description, recurrence)
        VALUES (?, ?, ?, ?)
    ''', (username, habit_name, description, recurrence))

    connection.commit()
    connection.close()
    print(f"Habit '{habit_name}' added successfully.")

# Log a habit completion
def log_habit_completion(habit_id, log_date):
    connection = sqlite3.connect('habit_tracking.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO habit_logs (habit_id, log_date)
        VALUES (?, ?)
    ''', (habit_id, log_date))

    connection.commit()
    connection.close()
    print(f"Habit ID {habit_id} logged for {log_date}.")

# Fetch habits for a user
def fetch_habits(username):
    connection = sqlite3.connect('habit_tracking.db')
    cursor = connection.cursor()

    cursor.execute('''
        SELECT id, habit_name, description, recurrence
        FROM habits
        WHERE username = ?
    ''', (username,))

    habits = cursor.fetchall()
    connection.close()
    return habits

# Fetch streaks for a habit
def fetch_habit_streak(habit_id):
    connection = sqlite3.connect('habit_tracking.db')
    cursor = connection.cursor()

    cursor.execute('''
        SELECT log_date
        FROM habit_logs
        WHERE habit_id = ?
        ORDER BY log_date ASC
    ''', (habit_id,))

    logs = cursor.fetchall()
    connection.close()

    # Calculate streaks
    streak = 0
    max_streak = 0
    previous_date = None

    for log in logs:
        current_date = datetime.strptime(log[0], '%Y-%m-%d').date()

        if previous_date is None or current_date == previous_date + timedelta(days=1):
            streak += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 1

        previous_date = current_date

    return streak, max_streak

# Display habits
def display_habits(username):
    habits = fetch_habits(username)

    print("\n--- Your Habits ---")
    for habit in habits:
        print(f"ID: {habit[0]}, Name: {habit[1]}, Description: {habit[2]}, Recurrence: {habit[3]}")
        streak, max_streak = fetch_habit_streak(habit[0])
        print(f"Current Streak: {streak} days, Longest Streak: {max_streak} days")
        print("---")

# Main interface for habit tracking
def habit_tracking_interface():
    print("\n--- Habit Tracking and Streak Tracking ---")
    username = input("Enter your username: ")

    while True:
        print("\nOptions:")
        print("1. Add a new habit")
        print("2. View your habits and streaks")
        print("3. Log a habit completion")
        print("4. Exit")

        choice = input("Choose an option: ")

        if choice == "1":
            habit_name = input("Enter the habit name: ")
            description = input("Enter a description (optional): ")
            recurrence = input("Enter the recurrence (daily/weekly): ")
            add_habit(username, habit_name, description, recurrence)
        elif choice == "2":
            display_habits(username)
        elif choice == "3":
            habit_id = int(input("Enter the habit ID: "))
            log_date = input("Enter the date of completion (YYYY-MM-DD): ")
            log_habit_completion(habit_id, log_date)
        elif choice == "4":
            print("Exiting... Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")

# Initialize the database
initialize_habit_tracking_database()

# Run the habit tracking interface
if __name__ == "__main__":
    habit_tracking_interface()


---
import sqlite3
from datetime import datetime, timedelta

# Initialize database for habit tracking and streak tracking

def initialize_habit_tracking_database():
    connection = sqlite3.connect('integrated_dashboard.db')
    cursor = connection.cursor()

    # Create table for habits
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            habit_name TEXT NOT NULL,
            description TEXT,
            recurrence TEXT NOT NULL, -- daily, weekly, etc.
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create table for habit logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            log_date DATE NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')

    connection.commit()
    connection.close()

# Add a new habit
def add_habit(username, habit_name, description, recurrence):
    connection = sqlite3.connect('integrated_dashboard.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO habits (username, habit_name, description, recurrence)
        VALUES (?, ?, ?, ?)
    ''', (username, habit_name, description, recurrence))

    connection.commit()
    connection.close()
    print(f"Habit '{habit_name}' added successfully.")

# Log a habit completion
def log_habit_completion(habit_id, log_date):
    connection = sqlite3.connect('integrated_dashboard.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO habit_logs (habit_id, log_date)
        VALUES (?, ?)
    ''', (habit_id, log_date))

    connection.commit()
    connection.close()
    print(f"Habit ID {habit_id} logged for {log_date}.")

# Fetch habits for a user
def fetch_habits(username):
    connection = sqlite3.connect('integrated_dashboard.db')
    cursor = connection.cursor()

    cursor.execute('''
        SELECT id, habit_name, description, recurrence
        FROM habits
        WHERE username = ?
    ''', (username,))

    habits = cursor.fetchall()
    connection.close()
    return habits

# Fetch streaks for a habit
def fetch_habit_streak(habit_id):
    connection = sqlite3.connect('integrated_dashboard.db')
    cursor = connection.cursor()

    cursor.execute('''
        SELECT log_date
        FROM habit_logs
        WHERE habit_id = ?
        ORDER BY log_date ASC
    ''', (habit_id,))

    logs = cursor.fetchall()
    connection.close()

    # Calculate streaks
    streak = 0
    max_streak = 0
    previous_date = None

    for log in logs:
        current_date = datetime.strptime(log[0], '%Y-%m-%d').date()

        if previous_date is None or current_date == previous_date + timedelta(days=1):
            streak += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 1

        previous_date = current_date

    return streak, max_streak

# Display habits
def display_habits(username):
    habits = fetch_habits(username)

    print("\n--- Your Habits ---")
    for habit in habits:
        print(f"ID: {habit[0]}, Name: {habit[1]}, Description: {habit[2]}, Recurrence: {habit[3]}")
        streak, max_streak = fetch_habit_streak(habit[0])
        print(f"Current Streak: {streak} days, Longest Streak: {max_streak} days")
        print("---")

# Integrated habit tracking interface
def habit_tracking_interface():
    print("\n--- Integrated Habit Tracking and Streak Tracking ---")
    username = input("Enter your username: ")

    while True:
        print("\nOptions:")
        print("1. Add a new habit")
        print("2. View your habits and streaks")
        print("3. Log a habit completion")
        print("4. Exit")

        choice = input("Choose an option: ")

        if choice == "1":
            habit_name = input("Enter the habit name: ")
            description = input("Enter a description (optional): ")
            recurrence = input("Enter the recurrence (daily/weekly): ")
            add_habit(username, habit_name, description, recurrence)
        elif choice == "2":
            display_habits(username)
        elif choice == "3":
            habit_id = int(input("Enter the habit ID: "))
            log_date = input("Enter the date of completion (YYYY-MM-DD): ")
            log_habit_completion(habit_id, log_date)
        elif choice == "4":
            print("Exiting... Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")

# Initialize the database
initialize_habit_tracking_database()

# Run the habit tracking interface
if __name__ == "__main__":
    habit_tracking_interface()



---
The **Habit Formation and Streak Tracking** tool has been successfully integrated into the **Integrated Dashboard**. Users can now manage habits and track their streaks alongside other features.

