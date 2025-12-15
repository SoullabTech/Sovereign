# Developing the CBT Framework for Spiralogic

## Why Incorporate CBT into Spiralogic?
Cognitive Behavioral Therapy (CBT) is a proven psychological framework that focuses on identifying and reframing unhelpful thoughts and behaviors. Integrating CBT into the Spiralogic process will allow users to:

- Enhance emotional regulation.
- Develop practical skills for challenging and reframing thoughts.
- Deepen self-awareness and align their mental patterns with their archetypal and elemental energies.

## Core Objectives
1. **Thought Tracking and Reframing**:
   - Enable users to identify negative or unhelpful thought patterns.
   - Provide tools to reframe these thoughts into empowering perspectives.

2. **Behavioral Activation**:
   - Link actions to positive emotional and cognitive states.
   - Encourage small, achievable steps to build momentum.

3. **Integration with Spiralogic Archetypes**:
   - Align CBT exercises with the user’s dominant and shadow archetypes.
   - Provide archetype-specific examples and strategies.

## Development Scope

### Phase 1: Thought Tracking and Reframing
1. **Thought Log**:
   - Users can log thoughts categorized as helpful or unhelpful.
   - Include contextual tags (e.g., "work," "relationships," "self-esteem").

2. **Cognitive Distortions Identification**:
   - Use prompts to help users recognize distortions like catastrophizing, black-and-white thinking, or personalization.

3. **Reframing Exercises**:
   - Offer templates for reframing unhelpful thoughts.
   - Provide examples based on Spiralogic archetypes (e.g., "The Nurturer may reframe 'I’m failing everyone' to 'I’m doing my best and that’s enough for now'").

### Phase 2: Behavioral Activation
1. **Action Planning**:
   - Suggest small, archetype-aligned actions (e.g., "The Builder might declutter their workspace").
   - Tie actions to emotional outcomes (e.g., "How will completing this task make you feel?").

2. **Tracking Progress**:
   - Log completed actions and associated emotional responses.
   - Visualize momentum over time through charts or progress bars.

3. **Reward Mechanisms**:
   - Celebrate milestones (e.g., completing 5 tasks) with badges or affirmations.

### Phase 3: Integration with Archetypes
1. **Archetype-Specific CBT Prompts**:
   - Provide reframing templates and behavioral suggestions tailored to archetypes.
   - Example: "The Explorer may need prompts to focus on one task rather than feeling overwhelmed by possibilities."

2. **Shadow Archetype Work**:
   - Incorporate exercises for exploring and integrating shadow aspects.
   - Example: "The Rebel might examine impulsive actions and reframe them as opportunities for strategic risk-taking."

### Phase 4: Feedback and Insights
1. **Real-Time Feedback**:
   - Offer encouragement or alternative reframing suggestions based on user inputs.

2. **Insights Dashboard**:
   - Show trends in thought patterns, progress in behavioral activation, and archetypal alignment.

## Implementation Plan

### Technical Components
1. **Database**:
   - Store thought logs, behavioral plans, and user progress.
   - Track archetypal alignment and emotional responses.

2. **Algorithms**:
   - Detect cognitive distortions in user inputs.
   - Generate archetype-aligned recommendations.

3. **User Interface**:
   - Simple, intuitive design for logging thoughts and actions.
   - Interactive visualizations for feedback and progress tracking.

### Development Milestones
1. **Prototype Thought Tracking and Reframing Module**
   - Launch with core functionalities like thought logs and reframing exercises.
2. **Add Behavioral Activation Features**
   - Introduce action planning and progress tracking.
3. **Integrate Archetype-Specific Insights**
   - Align CBT exercises with Spiralogic archetypes.
4. **Feedback and Iteration**
   - Gather user feedback and refine features.

## Deliverables
1. **Thought Tracking and Reframing Tool**
   - Logs, cognitive distortion identification, and reframing templates.
2. **Behavioral Activation Planner**
   - Action planning, progress tracking, and motivational tools.
3. **Archetypal Integration**
   - Archetype-specific examples and shadow work exercises.
4. **Insights Dashboard**
   - Visual progress tracking and feedback mechanisms.

## Outcomes
- Empower users to challenge unhelpful thoughts and behaviors.
- Foster alignment with archetypal and elemental energies.
- Enhance emotional resilience and self-awareness.

---

The **CBT Framework for Spiralogic** has been outlined, integrating thought tracking, reframing, behavioral activation, and archetypal alignment. Let me know if there are specific areas you'd like to expand on or refine further!

---


The next step is to **translate the outlined CBT framework into actionable components** for implementation. Here’s how we can proceed:

---

### **1. Build the Thought Tracking and Reframing Tool**

- **Define thought log structure**: Identify key fields (e.g., thought content, context tags, cognitive distortions).
- **Develop user interface**: Design input fields for logging thoughts and receiving feedback.
- **Automate cognitive distortion detection**: Implement algorithms to identify patterns (e.g., keywords for catastrophizing, personalization).

---

### **2. Design and Implement the Behavioral Activation Module**

- **Develop action planner**:
    - Create templates for goal setting and connecting tasks to emotional states.
    - Provide suggestions based on archetypes.
- **Visualize progress**:
    - Build charts or trackers for completed tasks and emotional outcomes.
- **Add motivational elements**:
    - Introduce small rewards for completing tasks, like badges or affirmations.

---

### **3. Create Archetype-Specific Content**

- **Design prompts and examples**:
    - Tailor reframing and actions to specific Spiralogic archetypes.
    - Include examples for shadow work exercises.
- **Align behavioral suggestions with elemental energies**:
    - Map actions to Fire, Water, Earth, and Air elements for archetypal balance.

---

### **4. Prototype and Test**

- **Develop a working prototype**:
    - Focus on thought logging and basic reframing for initial testing.
- **Test with users**:
    - Collect feedback on usability, clarity, and effectiveness.
- **Refine algorithms**:
    - Adjust cognitive distortion detection and archetype recommendations based on feedback.

---

### **5. Expand Features and Insights**

- **Incorporate real-time feedback**:
    - Develop suggestions that evolve with user inputs over time.
- **Launch insights dashboard**:
    - Visualize trends in thought patterns and archetypal alignment.

---

Would you like to focus on developing the **Thought Tracking Tool** first, or should we begin with the **Behavioral Activation Module**? Let me know your preference!

---

# Thought Tracking and Reframing Tool

## Development Plan

### **1. Thought Log Structure**
Define the fields for capturing user inputs:

- **Thought Content**: The exact thought the user is experiencing.
- **Context Tags**: Predefined or user-created tags (e.g., work, relationships, self-esteem).
- **Cognitive Distortions**: Identified distortions (e.g., catastrophizing, personalization).
- **Emotional Intensity**: Scale from 1-10 to measure the emotional impact.
- **Reframed Thought**: User’s attempt to rewrite the thought more positively or realistically.
- **Outcome**: Reflection on how reframing changed the emotional intensity.

### **2. User Interface Design**

#### Input Fields:
1. **Thought Input**: Text box for users to enter their thought.
2. **Context Selector**: Dropdown or tag-based system for categorizing the thought.
3. **Emotion Scale**: Slider or numeric input for rating emotional intensity.
4. **Reframing Suggestions**: Dynamic prompts to help users rewrite the thought.
5. **Outcome Reflection**: Space to record the impact of reframing.

#### Example Interface Workflow:
1. User logs a thought: *"I’ll never finish this project on time."
2. System suggests distortions: *Catastrophizing, All-or-Nothing Thinking.*
3. User selects a reframe: *"I’m behind schedule, but I can prioritize tasks to make progress."
4. Emotional intensity before/after logged: *10 -> 6.*

### **3. Automation of Cognitive Distortion Detection**

#### Algorithm:
- Use a database of common distortions with keywords and patterns:
  - Catastrophizing: Keywords like "never," "always," "worst."
  - Personalization: Phrases like "It’s my fault," "I should have."
- NLP techniques to analyze thought content for matches.

#### Output:
- Highlight potential distortions.
- Provide explanations and examples for each.

### **4. Reframing Exercises**

#### Templates:
1. **What evidence supports or disproves this thought?**
2. **What would you say to a friend thinking this way?**
3. **What is a more balanced perspective?**

#### Examples Based on Archetypes:
- **The Initiator**: "Instead of focusing on what I haven’t done, I’ll focus on the next step to lead the team forward."
- **The Nurturer**: "I’m not failing; I’m doing my best to support others while taking care of myself."

### **5. Feedback Mechanism**
- **Automated Suggestions**:
  - Provide prefilled reframes based on user input.
  - Offer supportive messages (e.g., "You’re making progress!").
- **Real-Time Emotional Tracking**:
  - Visualize changes in emotional intensity using bar charts or line graphs.

### **6. Insights Dashboard**
- **Trend Analysis**:
  - Most common distortions logged.
  - Improvement in emotional intensity over time.
- **Success Rate**:
  - Percentage of thoughts successfully reframed.

### **7. Technical Specifications**

#### Database Structure:
- **thought_logs**:
  - `id`: Unique identifier.
  - `username`: Associated user.
  - `thought_content`: Original thought.
  - `context_tag`: Contextual category.
  - `cognitive_distortion`: Identified distortion(s).
  - `emotional_intensity_before`: Pre-reframing intensity.
  - `reframed_thought`: User’s reframe.
  - `emotional_intensity_after`: Post-reframing intensity.
  - `timestamp`: Entry timestamp.

#### Backend:
- NLP integration for distortion detection.
- Algorithms to suggest archetype-aligned reframes.

#### Frontend:
- Intuitive form-based interface for thought logging.
- Interactive visualizations for tracking progress.

### **8. Milestones**
1. **Prototype Thought Logging System**:
   - Basic logging, distortion detection, and reframing prompts.
2. **Add Archetype-Specific Reframes**:
   - Tailored suggestions based on Spiralogic archetypes.
3. **Build Insights Dashboard**:
   - Visualize trends and progress metrics.
4. **Feedback and Iteration**:
   - Test with users and refine based on feedback.

---

This plan ensures the Thought Tracking and Reframing Tool becomes a cornerstone of the CBT framework within Spiralogic. Let me know if you'd like to dive deeper into any specific section or begin implementation!

---

# Behavioral Activation Module for Spiralogic

## Overview
The Behavioral Activation Module focuses on motivating users to take action aligned with their archetypes and emotional goals. By breaking tasks into manageable steps and linking actions to positive outcomes, the module will empower users to build momentum toward personal growth.

## Core Features
1. **Action Planner**:
   - Suggest small, archetype-aligned actions.
   - Allow users to set goals and define desired emotional outcomes.

2. **Progress Tracker**:
   - Log completed actions and track progress visually.
   - Show cumulative emotional improvements over time.

3. **Reward System**:
   - Celebrate milestones with badges and affirmations.
   - Provide feedback to encourage consistency.

4. **Integration with Archetypes**:
   - Tailor action suggestions to dominant and shadow archetypes.
   - Include tasks that align with Spiralogic elements (Fire, Water, Earth, Air).

---

## Development Plan

### Phase 1: Action Planning

#### 1. User Input:
- **Goal Setting**:
  - Users can enter specific goals (e.g., "Complete a work report," "Meditate for 10 minutes").
  - Define the associated emotional state (e.g., "Calm," "Accomplished").

- **Archetype Alignment**:
  - Suggest tasks aligned with user’s archetype:
    - **The Builder**: Organize a workspace.
    - **The Explorer**: Research a new topic or hobby.
    - **The Nurturer**: Write a supportive message to a friend.

#### 2. Emotional Outcomes:
- Allow users to select an emotional goal for each task.
- Example mapping:
  - Task: "Declutter workspace."
  - Emotional Goal: "Feel grounded and clear."

---

### Phase 2: Progress Tracking

#### 1. Action Log:
- Store information on completed tasks:
  - `task`: Task description.
  - `emotional_goal`: Emotional outcome the task supports.
  - `completion_status`: Whether the task is complete.
  - `timestamp`: Time of completion.

#### 2. Visual Feedback:
- Display cumulative progress through:
  - **Bar Graphs**: Number of tasks completed weekly.
  - **Pie Charts**: Emotional goals achieved.

#### 3. Emotional Trends:
- Show how completing tasks impacts emotional states over time.
- Example: Emotional intensity moving from "Stressed" to "Calm" after consistent meditation tasks.

---

### Phase 3: Reward System

#### 1. Badge Assignments:
- Award badges for milestones:
  - "5 Tasks Completed"
  - "First Week of Daily Actions"
  - "Emotional Goal Mastery"

#### 2. Feedback Mechanism:
- Provide affirmations:
  - "Great job staying consistent this week!"
  - "You’ve unlocked the Grounded Explorer badge!"

---

### Phase 4: Archetype-Specific Integration

#### 1. Archetype-Tailored Actions:
- Include actions tied to Spiralogic elements:
  - **Fire**: "Set a bold new goal."
  - **Water**: "Spend 10 minutes journaling emotions."
  - **Earth**: "Outline a practical plan for the week."
  - **Air**: "Share a meaningful insight with a peer."

#### 2. Shadow Work Actions:
- Encourage users to address shadow archetype traits:
  - **The Rebel**: "Channel your energy into constructive risk-taking."
  - **The Caregiver**: "Set a boundary to protect your energy."

---

## Technical Specifications

### Database Design
1. **action_logs**:
   - `id`: Unique identifier.
   - `username`: User who logged the action.
   - `task`: Description of the task.
   - `emotional_goal`: Emotional outcome.
   - `completion_status`: Boolean for task completion.
   - `timestamp`: Time of logging.

2. **milestones**:
   - `id`: Unique identifier.
   - `username`: User achieving the milestone.
   - `milestone_type`: Type of milestone (e.g., "Tasks Completed").
   - `timestamp`: Time of achievement.

### Backend Functions
1. **Add Task**:
   - Input: Task description, emotional goal, and archetype alignment.
   - Output: Stored task in `action_logs`.

2. **Mark Task Complete**:
   - Input: Task ID.
   - Output: Update `completion_status` and add timestamp.

3. **Generate Visuals**:
   - Use `matplotlib` or `plotly` to create bar and pie charts for progress.

4. **Reward Badges**:
   - Input: Number of completed tasks.
   - Output: Assign badge and store in `milestones`.

### Frontend Design
1. **Action Planner**:
   - Form-based input for task and emotional goal.
   - Dropdown for archetype-aligned suggestions.

2. **Progress Tracker**:
   - Dashboard with visualizations.
   - Section for earned badges and affirmations.

3. **Reward Notifications**:
   - Pop-ups or notifications for milestone achievements.

---

## Milestones
1. **Prototype Action Planner**:
   - Core functionality for task entry and emotional goal selection.
2. **Build Progress Tracker**:
   - Visual feedback for task completion and emotional trends.
3. **Implement Rewards System**:
   - Badge assignments and milestone tracking.
4. **Refine Archetype Integration**:
   - Tailor actions and feedback to Spiralogic archetypes.

---

This module is designed to motivate action and create measurable progress, aligning with the user’s archetypes and emotional goals. Let me know if you’d like to proceed with implementation of the prototype!


---

import sqlite3
from datetime import datetime

# Initialize database connection for the Behavioral Activation Module
def initialize_database():
    connection = sqlite3.connect('behavioral_activation.db')
    cursor = connection.cursor()

    # Create table for storing action logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            task TEXT NOT NULL,
            emotional_goal TEXT NOT NULL,
            completion_status INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create table for storing milestones
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            milestone_type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    connection.commit()
    connection.close()

# Add a new task for the user
def add_task(username, task, emotional_goal):
    connection = sqlite3.connect('behavioral_activation.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO action_logs (username, task, emotional_goal)
        VALUES (?, ?, ?)
    ''', (username, task, emotional_goal))

    connection.commit()
    connection.close()
    print(f"Task added: {task} with emotional goal: {emotional_goal}")

# Mark a task as completed
def mark_task_complete(task_id):
    connection = sqlite3.connect('behavioral_activation.db')
    cursor = connection.cursor()

    cursor.execute('''
        UPDATE action_logs
        SET completion_status = 1, timestamp = ?
        WHERE id = ?
    ''', (datetime.now(), task_id))

    connection.commit()
    connection.close()
    print(f"Task ID {task_id} marked as complete.")

# Display tasks and their statuses
def display_tasks(username):
    connection = sqlite3.connect('behavioral_activation.db')
    cursor = connection.cursor()

    cursor.execute('''
        SELECT id, task, emotional_goal, completion_status, timestamp
        FROM action_logs
        WHERE username = ?
    ''', (username,))

    tasks = cursor.fetchall()
    connection.close()

    print("\n--- Task List ---")
    for task in tasks:
        status = "Completed" if task[3] == 1 else "Incomplete"
        print(f"ID: {task[0]}, Task: {task[1]}, Emotional Goal: {task[2]}, Status: {status}, Timestamp: {task[4]}")

# Award a milestone to the user
def award_milestone(username, milestone_type):
    connection = sqlite3.connect('behavioral_activation.db')
    cursor = connection.cursor()

    cursor.execute('''
        INSERT INTO milestones (username, milestone_type)
        VALUES (?, ?)
    ''', (username, milestone_type))

    connection.commit()
    connection.close()
    print(f"Milestone awarded: {milestone_type}")

# Main Interface for the Action Planner Prototype
def action_planner_interface():
    print("\n--- Behavioral Activation Module ---")
    username = input("Enter your username: ")

    while True:
        print("\nOptions:")
        print("1. Add a new task")
        print("2. Mark a task as complete")
        print("3. View tasks")
        print("4. Award a milestone")
        print("5. Exit")

        choice = input("Choose an option: ")

        if choice == "1":
            task = input("Enter the task description: ")
            emotional_goal = input("Enter the emotional goal: ")
            add_task(username, task, emotional_goal)
        elif choice == "2":
            task_id = int(input("Enter the task ID to mark as complete: "))
            mark_task_complete(task_id)
        elif choice == "3":
            display_tasks(username)
        elif choice == "4":
            milestone_type = input("Enter the milestone type: ")
            award_milestone(username, milestone_type)
        elif choice == "5":
            print("Exiting... Goodbye!")
            break
        else:
            print("Invalid option. Please try again.")

# Initialize the database
initialize_database()

# Run the interface
if __name__ == "__main__":
    action_planner_interface()


---

The **Action Planner Prototype** has been implemented. It includes:

1. **Task Management**: Users can add tasks, mark them as complete, and view their progress.
2. **Milestone Tracking**: Milestones can be awarded based on user achievements.
3. **Database Integration**: All data is stored in a SQLite database for easy retrieval and updates.

Let me know if you'd like to test, refine, or expand this prototype further!



---
