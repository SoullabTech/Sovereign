-- Fix consciousness memory triggers without updated_at references

-- Function to automatically update goal progress when work sessions are recorded
CREATE OR REPLACE FUNCTION update_goal_progress_from_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the goal's sessions worked count and last worked timestamp
    UPDATE consciousness_goals
    SET
        sessions_worked = sessions_worked + 1,
        last_worked_at = NEW.completed_at,
        completion_percentage = LEAST(completion_percentage + CASE WHEN NEW.progress_made THEN 10.0 ELSE 5.0 END, 100.0)
    WHERE user_id = NEW.user_id AND goal_id = NEW.selected_goal_id;

    -- If significant progress was made, record it in the progress log
    IF NEW.progress_made THEN
        INSERT INTO consciousness_progress_log (
            user_id,
            goal_id,
            session_id,
            progress_type,
            progress_description,
            progress_amount,
            test_context
        ) VALUES (
            NEW.user_id,
            NEW.selected_goal_id,
            NEW.session_id,
            'work_performed',
            'Meaningful progress made in consciousness work session',
            10.0,
            NEW.test_results
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically update development plan when goals change
CREATE OR REPLACE FUNCTION update_development_plan_from_goals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the development plan's goal counts
    UPDATE consciousness_development_plans
    SET
        goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id),
        active_goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id AND status = 'in_progress'),
        completed_goals_count = (SELECT COUNT(*) FROM consciousness_goals WHERE user_id = NEW.user_id AND status = 'completed'),
        total_progress_percentage = (SELECT AVG(completion_percentage) FROM consciousness_goals WHERE user_id = NEW.user_id),
        last_updated = NOW()
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers
CREATE TRIGGER update_goal_progress_from_session_trigger
AFTER INSERT ON consciousness_work_sessions
FOR EACH ROW EXECUTE FUNCTION update_goal_progress_from_session();

CREATE TRIGGER update_development_plan_from_goals_trigger
AFTER INSERT OR UPDATE ON consciousness_goals
FOR EACH ROW EXECUTE FUNCTION update_development_plan_from_goals();

SELECT 'Consciousness memory triggers fixed!' as result;