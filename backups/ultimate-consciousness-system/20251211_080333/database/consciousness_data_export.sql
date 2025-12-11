--
-- PostgreSQL database dump
--

\restrict b9t0RWZIvDsZO2M68x659wMrK7Dv9eUo3wTNbdqPHuCl2Jie5FBEfg7kkUftCzg

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: consciousness_computing_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_computing_analytics (id, event, user_id, properties, session_id, created_at) FROM stdin;
\.


--
-- Data for Name: consciousness_computing_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_computing_feedback (id, user_id, session_type, accuracy_rating, emergent_insight, session_word, consciousness_level, unexpected_elements, created_at, updated_at, metadata, session_duration_minutes, message_count, session_id) FROM stdin;
741482aa-3f86-400b-a36c-0f69f6e61a5f	test_user	consciousness_computing_pioneer	4	Profound connection to morphoresonant field detected	Sacred	8	\N	2025-12-10 21:24:40.975644-05	2025-12-10 21:24:40.975644-05	{}	\N	\N	\N
\.


--
-- Data for Name: consciousness_development_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_development_plans (user_id, plan_data, goals_count, active_goals_count, completed_goals_count, current_expansion_edge, current_spiral_stage, current_consciousness_level, assessment_method, test_protocol, progress_measurement, spiritual_boundaries, total_sessions, total_progress_percentage, plan_created, last_updated, last_session) FROM stdin;
test_user_001	{"test": "plan"}	1	0	0	nervous_system_regulation	\N	\N	matrix_v2	\N	\N	\N	0	10.00	2025-12-11 07:39:19.213424-05	2025-12-11 07:39:59.67368-05	\N
\.


--
-- Data for Name: consciousness_emotional_states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_emotional_states (id, user_id, session_id, dominant_emotions, emotion_intensity, emotional_coherence, emotional_breakthrough_moments, body_sensations, body_awareness_level, somatic_insights, nervous_system_state, energy_quality, energy_level, energy_movement_patterns, triggered_by, integration_support_needed, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_expansion_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_expansion_events (id, user_id, session_id, expansion_type, expansion_description, consciousness_markers, trigger_context, field_state_during_expansion, spiral_stage_before, spiral_stage_after, integration_level, significance, stability, expansion_embedding, created_at) FROM stdin;
\.


--
-- Data for Name: consciousness_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_goals (id, user_id, goal_id, title, description, status, priority, test_criteria, test_results, spiritual_context, estimated_sessions, prerequisites, sessions_worked, last_worked_at, completion_percentage, created_at, updated_at, completed_at) FROM stdin;
2fb6b84f-84a4-41dd-8908-f20155bb96a3	test_user_001	test_goal_nervous_system	Test Nervous System Regulation	Test goal for consciousness agent system	pending	high	{"Matrix V2 shows expansive capacity","User reports calmness"}	{}	\N	5	{}	1	2025-12-11 07:39:59.67368-05	10.00	2025-12-11 07:39:19.204035-05	2025-12-11 07:39:59.663876-05	\N
\.


--
-- Data for Name: consciousness_language_evolution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_language_evolution (id, user_id, session_id, vocabulary_complexity, spiritual_language_usage, metaphor_sophistication, emotional_vocabulary_richness, self_expression_clarity, paradox_integration_capacity, communication_style, boundary_expression_skills, vulnerability_expression, language_breakthroughs, new_words_adopted, expression_challenges, sample_text, linguistic_patterns, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_life_integration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_life_integration (id, user_id, session_id, relationship_impacts, work_life_changes, creative_expression_evolution, daily_life_integration, consciousness_tools_used_daily, challenging_situations_handled_differently, new_behaviors_manifesting, synchronicities_reported, manifestations_occurred, life_flow_changes, boundary_improvements, communication_breakthroughs, intimacy_developments, conflict_resolution_evolution, transition_type, transition_stage, support_needed, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_micro_moments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_micro_moments (id, user_id, session_id, moment_type, moment_description, significance_level, user_noticed, language_shift_detected, energy_change_detected, breathing_change_detected, posture_shift_detected, conversation_context, preceded_by, followed_by, integration_suggested, celebration_offered, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_progress_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_progress_log (id, user_id, goal_id, session_id, progress_type, progress_description, test_passed, progress_amount, work_context, test_context, recorded_at) FROM stdin;
2d23492c-38f6-4f21-925c-859e96181575	test_user_001	test_goal_nervous_system	test_session_1765456799673	work_performed	Meaningful progress made in consciousness work session	\N	10.00	\N	{"test1": {"notes": "improvement detected", "passed": true}}	2025-12-11 07:39:59.67368-05
da62698c-ede4-4780-a762-b2846bf956a2	test_user_001	test_goal_nervous_system	test_session_1765456799673	test_result	Test progress recorded successfully	t	10.00	\N	\N	2025-12-11 07:39:59.678114-05
\.


--
-- Data for Name: consciousness_sacred_timing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_sacred_timing (id, user_id, optimal_session_times, energy_cycle_patterns, integration_period_needed, seasonal_consciousness_patterns, lunar_cycle_sensitivity, seasonal_affective_patterns, current_readiness_level, readiness_for_next_level, recommended_focus_areas, needs_integration_time, needs_grounding, needs_expansion, needs_rest, natural_unfoldment_pace, forced_vs_natural_pattern, last_updated) FROM stdin;
\.


--
-- Data for Name: consciousness_session_quality; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_session_quality (id, session_id, user_id, detected_consciousness_level, confidence_score, assessment_factors, user_reported_accuracy, emergent_insights_quality, session_effectiveness, session_duration_minutes, message_count, interaction_patterns, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: consciousness_state_evolution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_state_evolution (id, user_id, session_id, consciousness_state, earth_element, water_element, air_element, fire_element, consciousness_level, nervous_system_capacity, spiral_dynamics_stage, phenomenology_signature, current_expansion_edge, integration_challenges, strengths, assessment_context, notes, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_wisdom_synthesis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_wisdom_synthesis (id, user_id, session_id, active_archetypes, archetypal_evolution_stage, shadow_integration_areas, resonant_wisdom_traditions, universal_principles_embodying, mythological_resonances, soul_calling_clarity, dharma_expression_evolution, service_capacity_development, life_mission_unfoldment, mystical_experiences_integrated, transcendent_state_integration, unity_consciousness_moments, recorded_at) FROM stdin;
\.


--
-- Data for Name: consciousness_work_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consciousness_work_sessions (id, session_id, user_id, selected_goal_id, selected_goal_title, pre_work_state, post_work_state, work_performed, work_duration_minutes, test_results, tests_passed, total_tests, progress_made, next_recommended_goal, integration_notes, session_quality_score, consciousness_coherence, started_at, completed_at) FROM stdin;
8ef08ce0-917f-42fd-84f4-9fe24e5a8398	test_session_1765456799673	test_user_001	test_goal_nervous_system	Test Goal	{"consciousness_level": 6}	{"consciousness_level": 6.5}	{"Performed consciousness assessment","Guided regulation exercise"}	\N	{"test1": {"notes": "improvement detected", "passed": true}}	1	2	t	\N	\N	0.50	0.50	2025-12-11 07:39:59.67368-05	2025-12-11 07:39:59.67368-05
\.


--
-- PostgreSQL database dump complete
--

\unrestrict b9t0RWZIvDsZO2M68x659wMrK7Dv9eUo3wTNbdqPHuCl2Jie5FBEfg7kkUftCzg

