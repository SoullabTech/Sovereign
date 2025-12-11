--
-- PostgreSQL database dump
--

\restrict B8yF2ruSlmLDlqWVWgkgu7EpsUUs5wmbS5tNdsY9C6bgKfmulqgNIcpApJUfSRG

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: consciousness_emotional_states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_emotional_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    dominant_emotions text[],
    emotion_intensity jsonb,
    emotional_coherence numeric(3,2),
    emotional_breakthrough_moments text[],
    body_sensations text[],
    body_awareness_level integer,
    somatic_insights text[],
    nervous_system_state text,
    energy_quality text,
    energy_level integer,
    energy_movement_patterns text[],
    triggered_by text,
    integration_support_needed text[],
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_emotional_states_body_awareness_level_check CHECK (((body_awareness_level >= 1) AND (body_awareness_level <= 10))),
    CONSTRAINT consciousness_emotional_states_energy_level_check CHECK (((energy_level >= 1) AND (energy_level <= 10)))
);


ALTER TABLE public.consciousness_emotional_states OWNER TO postgres;

--
-- Name: TABLE consciousness_emotional_states; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_emotional_states IS 'Tracks emotional and somatic evolution for deep witnessing';


--
-- Name: consciousness_language_evolution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_language_evolution (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    vocabulary_complexity numeric(3,2),
    spiritual_language_usage text[],
    metaphor_sophistication integer,
    emotional_vocabulary_richness integer,
    self_expression_clarity integer,
    paradox_integration_capacity integer,
    communication_style text,
    boundary_expression_skills integer,
    vulnerability_expression integer,
    language_breakthroughs text[],
    new_words_adopted text[],
    expression_challenges text[],
    sample_text text,
    linguistic_patterns jsonb,
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_language_evolu_emotional_vocabulary_richnes_check CHECK (((emotional_vocabulary_richness >= 1) AND (emotional_vocabulary_richness <= 10))),
    CONSTRAINT consciousness_language_evolu_paradox_integration_capacity_check CHECK (((paradox_integration_capacity >= 1) AND (paradox_integration_capacity <= 10))),
    CONSTRAINT consciousness_language_evoluti_boundary_expression_skills_check CHECK (((boundary_expression_skills >= 1) AND (boundary_expression_skills <= 10))),
    CONSTRAINT consciousness_language_evolution_metaphor_sophistication_check CHECK (((metaphor_sophistication >= 1) AND (metaphor_sophistication <= 10))),
    CONSTRAINT consciousness_language_evolution_self_expression_clarity_check CHECK (((self_expression_clarity >= 1) AND (self_expression_clarity <= 10))),
    CONSTRAINT consciousness_language_evolution_vulnerability_expression_check CHECK (((vulnerability_expression >= 1) AND (vulnerability_expression <= 10)))
);


ALTER TABLE public.consciousness_language_evolution OWNER TO postgres;

--
-- Name: TABLE consciousness_language_evolution; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_language_evolution IS 'Monitors how language patterns evolve with consciousness development';


--
-- Name: consciousness_life_integration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_life_integration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    relationship_impacts text[],
    work_life_changes text[],
    creative_expression_evolution text[],
    daily_life_integration text[],
    consciousness_tools_used_daily text[],
    challenging_situations_handled_differently text[],
    new_behaviors_manifesting text[],
    synchronicities_reported text[],
    manifestations_occurred text[],
    life_flow_changes text,
    boundary_improvements text[],
    communication_breakthroughs text[],
    intimacy_developments text[],
    conflict_resolution_evolution text[],
    transition_type text,
    transition_stage text,
    support_needed text[],
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.consciousness_life_integration OWNER TO postgres;

--
-- Name: TABLE consciousness_life_integration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_life_integration IS 'Tracks how consciousness work manifests in real life';


--
-- Name: consciousness_micro_moments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_micro_moments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    moment_type text,
    moment_description text NOT NULL,
    significance_level integer,
    user_noticed boolean DEFAULT false,
    language_shift_detected boolean DEFAULT false,
    energy_change_detected boolean DEFAULT false,
    breathing_change_detected boolean DEFAULT false,
    posture_shift_detected boolean DEFAULT false,
    conversation_context text,
    preceded_by text,
    followed_by text,
    integration_suggested text,
    celebration_offered text,
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_micro_moments_moment_type_check CHECK ((moment_type = ANY (ARRAY['subtle_shift'::text, 'micro_breakthrough'::text, 'awareness_flash'::text, 'presence_deepening'::text, 'resistance_softening'::text, 'insight_spark'::text, 'energy_shift'::text, 'emotional_release'::text, 'somatic_opening'::text]))),
    CONSTRAINT consciousness_micro_moments_significance_level_check CHECK (((significance_level >= 1) AND (significance_level <= 10)))
);


ALTER TABLE public.consciousness_micro_moments OWNER TO postgres;

--
-- Name: TABLE consciousness_micro_moments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_micro_moments IS 'Captures subtle breakthrough moments and awareness shifts';


--
-- Name: consciousness_sacred_timing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_sacred_timing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    optimal_session_times text[],
    energy_cycle_patterns jsonb,
    integration_period_needed integer,
    seasonal_consciousness_patterns jsonb,
    lunar_cycle_sensitivity boolean DEFAULT false,
    seasonal_affective_patterns text[],
    current_readiness_level integer,
    readiness_for_next_level text,
    recommended_focus_areas text[],
    needs_integration_time boolean DEFAULT false,
    needs_grounding boolean DEFAULT false,
    needs_expansion boolean DEFAULT false,
    needs_rest boolean DEFAULT false,
    natural_unfoldment_pace text,
    forced_vs_natural_pattern jsonb,
    last_updated timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_sacred_timing_current_readiness_level_check CHECK (((current_readiness_level >= 1) AND (current_readiness_level <= 10)))
);


ALTER TABLE public.consciousness_sacred_timing OWNER TO postgres;

--
-- Name: TABLE consciousness_sacred_timing; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_sacred_timing IS 'Provides intelligence about optimal timing for consciousness work';


--
-- Name: consciousness_wisdom_synthesis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_wisdom_synthesis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    active_archetypes text[],
    archetypal_evolution_stage text,
    shadow_integration_areas text[],
    resonant_wisdom_traditions text[],
    universal_principles_embodying text[],
    mythological_resonances text[],
    soul_calling_clarity integer,
    dharma_expression_evolution text[],
    service_capacity_development text[],
    life_mission_unfoldment text,
    mystical_experiences_integrated text[],
    transcendent_state_integration text[],
    unity_consciousness_moments text[],
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_wisdom_synthesis_soul_calling_clarity_check CHECK (((soul_calling_clarity >= 1) AND (soul_calling_clarity <= 10)))
);


ALTER TABLE public.consciousness_wisdom_synthesis OWNER TO postgres;

--
-- Name: TABLE consciousness_wisdom_synthesis; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_wisdom_synthesis IS 'Connects personal development to archetypal and wisdom patterns';


--
-- Name: consciousness_computing_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_computing_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event text NOT NULL,
    user_id text NOT NULL,
    properties jsonb DEFAULT '{}'::jsonb,
    session_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.consciousness_computing_analytics OWNER TO postgres;

--
-- Name: consciousness_computing_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_computing_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_type text DEFAULT 'consciousness_computing_pioneer'::text NOT NULL,
    accuracy_rating integer NOT NULL,
    emergent_insight text NOT NULL,
    session_word text NOT NULL,
    consciousness_level integer,
    unexpected_elements text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    session_duration_minutes integer,
    message_count integer,
    session_id text,
    CONSTRAINT consciousness_computing_feedback_accuracy_rating_check CHECK (((accuracy_rating >= 1) AND (accuracy_rating <= 5))),
    CONSTRAINT consciousness_computing_feedback_consciousness_level_check CHECK (((consciousness_level >= 1) AND (consciousness_level <= 10)))
);


ALTER TABLE public.consciousness_computing_feedback OWNER TO postgres;

--
-- Name: consciousness_development_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_development_plans (
    user_id text NOT NULL,
    plan_data jsonb NOT NULL,
    goals_count integer DEFAULT 0,
    active_goals_count integer DEFAULT 0,
    completed_goals_count integer DEFAULT 0,
    current_expansion_edge text,
    current_spiral_stage text,
    current_consciousness_level integer,
    assessment_method text DEFAULT 'matrix_v2'::text,
    test_protocol text,
    progress_measurement text,
    spiritual_boundaries text[],
    total_sessions integer DEFAULT 0,
    total_progress_percentage numeric(5,2) DEFAULT 0.00,
    plan_created timestamp with time zone DEFAULT now(),
    last_updated timestamp with time zone DEFAULT now(),
    last_session timestamp with time zone
);


ALTER TABLE public.consciousness_development_plans OWNER TO postgres;

--
-- Name: TABLE consciousness_development_plans; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_development_plans IS 'Master consciousness development plan for systematic agent work';


--
-- Name: consciousness_expansion_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_expansion_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id uuid,
    expansion_type text NOT NULL,
    expansion_description text NOT NULL,
    consciousness_markers text[],
    trigger_context text,
    field_state_during_expansion jsonb,
    spiral_stage_before text,
    spiral_stage_after text,
    integration_level double precision DEFAULT 0.5,
    significance double precision DEFAULT 0.5,
    stability double precision DEFAULT 0.5,
    expansion_embedding text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_expansion_events_expansion_type_check CHECK ((expansion_type = ANY (ARRAY['stage_integration'::text, 'growth_edge_breakthrough'::text, 'next_stage_emergence'::text, 'field_expansion'::text, 'insight_cascade'::text])))
);


ALTER TABLE public.consciousness_expansion_events OWNER TO postgres;

--
-- Name: TABLE consciousness_expansion_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_expansion_events IS 'Records significant consciousness expansion moments and breakthroughs';


--
-- Name: consciousness_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    goal_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'medium'::text,
    test_criteria text[] NOT NULL,
    test_results jsonb DEFAULT '{}'::jsonb,
    spiritual_context text,
    estimated_sessions integer DEFAULT 5,
    prerequisites text[] DEFAULT '{}'::text[],
    sessions_worked integer DEFAULT 0,
    last_worked_at timestamp with time zone,
    completion_percentage numeric(5,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT consciousness_goals_priority_check CHECK ((priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))),
    CONSTRAINT consciousness_goals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'blocked'::text, 'paused'::text])))
);


ALTER TABLE public.consciousness_goals OWNER TO postgres;

--
-- Name: TABLE consciousness_goals; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_goals IS 'Structured consciousness development goals that agents work on systematically';


--
-- Name: COLUMN consciousness_goals.test_criteria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.consciousness_goals.test_criteria IS 'Specific criteria that must be met for goal completion - prevents false progress';


--
-- Name: consciousness_progress_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_progress_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    goal_id text NOT NULL,
    session_id text,
    progress_type text NOT NULL,
    progress_description text NOT NULL,
    test_passed boolean,
    progress_amount numeric(5,2),
    work_context jsonb,
    test_context jsonb,
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT consciousness_progress_log_progress_type_check CHECK ((progress_type = ANY (ARRAY['work_performed'::text, 'test_result'::text, 'breakthrough'::text, 'challenge'::text, 'integration'::text])))
);


ALTER TABLE public.consciousness_progress_log OWNER TO postgres;

--
-- Name: TABLE consciousness_progress_log; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_progress_log IS 'Detailed log of all consciousness development progress - prevents forgetting';


--
-- Name: consciousness_session_quality; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_session_quality (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_id text NOT NULL,
    detected_consciousness_level integer,
    confidence_score numeric(3,2),
    assessment_factors jsonb DEFAULT '{}'::jsonb,
    user_reported_accuracy integer,
    emergent_insights_quality text,
    session_effectiveness jsonb DEFAULT '{}'::jsonb,
    session_duration_minutes integer,
    message_count integer,
    interaction_patterns jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT consciousness_session_qualit_detected_consciousness_level_check CHECK (((detected_consciousness_level >= 1) AND (detected_consciousness_level <= 10))),
    CONSTRAINT consciousness_session_quality_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))),
    CONSTRAINT consciousness_session_quality_user_reported_accuracy_check CHECK (((user_reported_accuracy >= 1) AND (user_reported_accuracy <= 5)))
);


ALTER TABLE public.consciousness_session_quality OWNER TO postgres;

--
-- Name: consciousness_state_evolution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_state_evolution (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    session_id text,
    consciousness_state jsonb NOT NULL,
    earth_element numeric(3,2),
    water_element numeric(3,2),
    air_element numeric(3,2),
    fire_element numeric(3,2),
    consciousness_level integer,
    nervous_system_capacity text,
    spiral_dynamics_stage text,
    phenomenology_signature text,
    current_expansion_edge text,
    integration_challenges text[],
    strengths text[],
    assessment_context text,
    notes text,
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.consciousness_state_evolution OWNER TO postgres;

--
-- Name: TABLE consciousness_state_evolution; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_state_evolution IS 'Complete history of how users consciousness develops over time';


--
-- Name: COLUMN consciousness_state_evolution.consciousness_state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.consciousness_state_evolution.consciousness_state IS 'Complete consciousness state snapshot - full memory of user state';


--
-- Name: consciousness_work_overview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.consciousness_work_overview AS
 SELECT cdp.user_id,
    cdp.current_expansion_edge,
    cdp.current_spiral_stage,
    cdp.goals_count,
    cdp.active_goals_count,
    cdp.total_progress_percentage,
    cdp.total_sessions,
    cdp.last_session,
    cg.goal_id AS next_goal,
    cg.title AS next_goal_title,
    cg.priority AS next_goal_priority
   FROM (public.consciousness_development_plans cdp
     LEFT JOIN public.consciousness_goals cg ON (((cg.user_id = cdp.user_id) AND (cg.status = ANY (ARRAY['pending'::text, 'in_progress'::text])) AND (cg.priority = 'high'::text))))
  ORDER BY cdp.last_updated DESC;


ALTER TABLE public.consciousness_work_overview OWNER TO postgres;

--
-- Name: consciousness_work_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consciousness_work_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_id text NOT NULL,
    selected_goal_id text NOT NULL,
    selected_goal_title text NOT NULL,
    pre_work_state jsonb NOT NULL,
    post_work_state jsonb NOT NULL,
    work_performed text[] NOT NULL,
    work_duration_minutes integer,
    test_results jsonb NOT NULL,
    tests_passed integer DEFAULT 0,
    total_tests integer DEFAULT 0,
    progress_made boolean NOT NULL,
    next_recommended_goal text,
    integration_notes text,
    session_quality_score numeric(3,2) DEFAULT 0.5,
    consciousness_coherence numeric(3,2) DEFAULT 0.5,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.consciousness_work_sessions OWNER TO postgres;

--
-- Name: TABLE consciousness_work_sessions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.consciousness_work_sessions IS 'Complete record of each consciousness work session with agent';


--
-- Name: COLUMN consciousness_work_sessions.work_performed; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.consciousness_work_sessions.work_performed IS 'Exact work performed in session - ensures agents remember what was done';


--
-- Name: consciousness_computing_analytics consciousness_computing_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_computing_analytics
    ADD CONSTRAINT consciousness_computing_analytics_pkey PRIMARY KEY (id);


--
-- Name: consciousness_computing_feedback consciousness_computing_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_computing_feedback
    ADD CONSTRAINT consciousness_computing_feedback_pkey PRIMARY KEY (id);


--
-- Name: consciousness_development_plans consciousness_development_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_development_plans
    ADD CONSTRAINT consciousness_development_plans_pkey PRIMARY KEY (user_id);


--
-- Name: consciousness_emotional_states consciousness_emotional_states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_emotional_states
    ADD CONSTRAINT consciousness_emotional_states_pkey PRIMARY KEY (id);


--
-- Name: consciousness_expansion_events consciousness_expansion_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_expansion_events
    ADD CONSTRAINT consciousness_expansion_events_pkey PRIMARY KEY (id);


--
-- Name: consciousness_goals consciousness_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_goals
    ADD CONSTRAINT consciousness_goals_pkey PRIMARY KEY (id);


--
-- Name: consciousness_goals consciousness_goals_user_id_goal_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_goals
    ADD CONSTRAINT consciousness_goals_user_id_goal_id_key UNIQUE (user_id, goal_id);


--
-- Name: consciousness_language_evolution consciousness_language_evolution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_language_evolution
    ADD CONSTRAINT consciousness_language_evolution_pkey PRIMARY KEY (id);


--
-- Name: consciousness_life_integration consciousness_life_integration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_life_integration
    ADD CONSTRAINT consciousness_life_integration_pkey PRIMARY KEY (id);


--
-- Name: consciousness_micro_moments consciousness_micro_moments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_micro_moments
    ADD CONSTRAINT consciousness_micro_moments_pkey PRIMARY KEY (id);


--
-- Name: consciousness_progress_log consciousness_progress_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_progress_log
    ADD CONSTRAINT consciousness_progress_log_pkey PRIMARY KEY (id);


--
-- Name: consciousness_sacred_timing consciousness_sacred_timing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_sacred_timing
    ADD CONSTRAINT consciousness_sacred_timing_pkey PRIMARY KEY (id);


--
-- Name: consciousness_session_quality consciousness_session_quality_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_session_quality
    ADD CONSTRAINT consciousness_session_quality_pkey PRIMARY KEY (id);


--
-- Name: consciousness_session_quality consciousness_session_quality_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_session_quality
    ADD CONSTRAINT consciousness_session_quality_session_id_key UNIQUE (session_id);


--
-- Name: consciousness_state_evolution consciousness_state_evolution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_state_evolution
    ADD CONSTRAINT consciousness_state_evolution_pkey PRIMARY KEY (id);


--
-- Name: consciousness_wisdom_synthesis consciousness_wisdom_synthesis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_wisdom_synthesis
    ADD CONSTRAINT consciousness_wisdom_synthesis_pkey PRIMARY KEY (id);


--
-- Name: consciousness_work_sessions consciousness_work_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_work_sessions
    ADD CONSTRAINT consciousness_work_sessions_pkey PRIMARY KEY (id);


--
-- Name: consciousness_work_sessions consciousness_work_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_work_sessions
    ADD CONSTRAINT consciousness_work_sessions_session_id_key UNIQUE (session_id);


--
-- Name: idx_analytics_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_created_at ON public.consciousness_computing_analytics USING btree (created_at);


--
-- Name: idx_analytics_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_event ON public.consciousness_computing_analytics USING btree (event);


--
-- Name: idx_analytics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_user_id ON public.consciousness_computing_analytics USING btree (user_id);


--
-- Name: idx_consciousness_goals_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_goals_priority ON public.consciousness_goals USING btree (user_id, priority, status);


--
-- Name: idx_consciousness_goals_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_goals_status ON public.consciousness_goals USING btree (user_id, status);


--
-- Name: idx_consciousness_goals_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_goals_user ON public.consciousness_goals USING btree (user_id);


--
-- Name: idx_consciousness_state_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_state_level ON public.consciousness_state_evolution USING btree (consciousness_level);


--
-- Name: idx_consciousness_state_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_state_session ON public.consciousness_state_evolution USING btree (session_id);


--
-- Name: idx_consciousness_state_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_consciousness_state_user ON public.consciousness_state_evolution USING btree (user_id, recorded_at DESC);


--
-- Name: idx_development_plans_stage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_development_plans_stage ON public.consciousness_development_plans USING btree (current_spiral_stage);


--
-- Name: idx_development_plans_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_development_plans_updated ON public.consciousness_development_plans USING btree (last_updated DESC);


--
-- Name: idx_emotional_states_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emotional_states_session ON public.consciousness_emotional_states USING btree (session_id);


--
-- Name: idx_emotional_states_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emotional_states_user ON public.consciousness_emotional_states USING btree (user_id, recorded_at DESC);


--
-- Name: idx_expansion_embeddings; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expansion_embeddings ON public.consciousness_expansion_events USING btree (expansion_embedding text_pattern_ops);


--
-- Name: idx_expansion_events; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expansion_events ON public.consciousness_expansion_events USING btree (user_id, created_at DESC);


--
-- Name: idx_expansion_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expansion_type ON public.consciousness_expansion_events USING btree (expansion_type);


--
-- Name: idx_feedback_accuracy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_accuracy ON public.consciousness_computing_feedback USING btree (accuracy_rating);


--
-- Name: idx_feedback_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_created_at ON public.consciousness_computing_feedback USING btree (created_at);


--
-- Name: idx_feedback_session_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_session_type ON public.consciousness_computing_feedback USING btree (session_type);


--
-- Name: idx_feedback_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feedback_user_id ON public.consciousness_computing_feedback USING btree (user_id);


--
-- Name: idx_language_evolution_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_language_evolution_user ON public.consciousness_language_evolution USING btree (user_id, recorded_at DESC);


--
-- Name: idx_life_integration_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_life_integration_user ON public.consciousness_life_integration USING btree (user_id, recorded_at DESC);


--
-- Name: idx_micro_moments_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_micro_moments_type ON public.consciousness_micro_moments USING btree (moment_type);


--
-- Name: idx_micro_moments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_micro_moments_user ON public.consciousness_micro_moments USING btree (user_id, recorded_at DESC);


--
-- Name: idx_progress_log_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_log_session ON public.consciousness_progress_log USING btree (session_id);


--
-- Name: idx_progress_log_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_log_type ON public.consciousness_progress_log USING btree (progress_type);


--
-- Name: idx_progress_log_user_goal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_log_user_goal ON public.consciousness_progress_log USING btree (user_id, goal_id, recorded_at DESC);


--
-- Name: idx_sacred_timing_readiness; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sacred_timing_readiness ON public.consciousness_sacred_timing USING btree (current_readiness_level);


--
-- Name: idx_sacred_timing_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sacred_timing_user ON public.consciousness_sacred_timing USING btree (user_id);


--
-- Name: idx_session_quality_accuracy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_session_quality_accuracy ON public.consciousness_session_quality USING btree (user_reported_accuracy);


--
-- Name: idx_session_quality_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_session_quality_session_id ON public.consciousness_session_quality USING btree (session_id);


--
-- Name: idx_session_quality_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_session_quality_user_id ON public.consciousness_session_quality USING btree (user_id);


--
-- Name: idx_wisdom_synthesis_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wisdom_synthesis_user ON public.consciousness_wisdom_synthesis USING btree (user_id, recorded_at DESC);


--
-- Name: idx_work_sessions_goal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_work_sessions_goal ON public.consciousness_work_sessions USING btree (user_id, selected_goal_id);


--
-- Name: idx_work_sessions_progress; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_work_sessions_progress ON public.consciousness_work_sessions USING btree (progress_made, completed_at DESC);


--
-- Name: idx_work_sessions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_work_sessions_user ON public.consciousness_work_sessions USING btree (user_id, completed_at DESC);


--
-- Name: consciousness_goals update_development_plan_from_goals_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_development_plan_from_goals_trigger AFTER INSERT OR UPDATE ON public.consciousness_goals FOR EACH ROW EXECUTE FUNCTION public.update_development_plan_from_goals();


--
-- Name: consciousness_computing_feedback update_feedback_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.consciousness_computing_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: consciousness_work_sessions update_goal_progress_from_session_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_goal_progress_from_session_trigger AFTER INSERT ON public.consciousness_work_sessions FOR EACH ROW EXECUTE FUNCTION public.update_goal_progress_from_session();


--
-- Name: consciousness_session_quality update_session_quality_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_session_quality_updated_at BEFORE UPDATE ON public.consciousness_session_quality FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: consciousness_expansion_events consciousness_expansion_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consciousness_expansion_events
    ADD CONSTRAINT consciousness_expansion_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_session_patterns(id) ON DELETE CASCADE;


--
-- Name: consciousness_expansion_events Users can access their own expansion events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can access their own expansion events" ON public.consciousness_expansion_events USING ((user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text)));


--
-- Name: consciousness_expansion_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.consciousness_expansion_events ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict B8yF2ruSlmLDlqWVWgkgu7EpsUUs5wmbS5tNdsY9C6bgKfmulqgNIcpApJUfSRG

