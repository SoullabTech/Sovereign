--
-- PostgreSQL database dump
--

\restrict UO8pB64opy7K13VMsC3SWI4dU3BmpHsBhRealD6vY0CyjmI9dBZjwxffGnfGQ2K

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg12+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg12+1)

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
-- Name: agent_runs; Type: TABLE; Schema: public; Owner: soullab
--

CREATE TABLE public.agent_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    session_id text,
    turn_id integer,
    user_id text,
    req_id text,
    agent_name text,
    element text,
    epistemic_mode text,
    phase text,
    source text,
    input_summary text,
    output_text text,
    output_json jsonb,
    latency_ms integer,
    status text DEFAULT 'ok'::text,
    error text,
    confidence real,
    intensity real,
    inhibited_by text,
    meta jsonb,
    origin_route text,
    processing_profile text,
    posture_at_creation text,
    CONSTRAINT agent_runs_posture_valid CHECK (((posture_at_creation IS NULL) OR (posture_at_creation = ANY (ARRAY['normal'::text, 'sanctuary'::text, 'unknown-historical'::text]))))
);


ALTER TABLE public.agent_runs OWNER TO soullab;

--
-- Name: TABLE agent_runs; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON TABLE public.agent_runs IS 'Bounded agent execution log. Observability only — no auto-feedback.';


--
-- Name: COLUMN agent_runs.session_id; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.session_id IS 'Session ID linking agent run to conversation session';


--
-- Name: COLUMN agent_runs.turn_id; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.turn_id IS 'Turn ID within the conversation';


--
-- Name: COLUMN agent_runs.agent_name; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.agent_name IS 'Name of the agent that produced this output';


--
-- Name: COLUMN agent_runs.epistemic_mode; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.epistemic_mode IS 'Epistemic mode: structured, symbolic, relational, etc.';


--
-- Name: COLUMN agent_runs.phase; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.phase IS 'Processing phase: intake, process, integrate';


--
-- Name: COLUMN agent_runs.status; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.status IS 'Run status: ok, error, inhibited';


--
-- Name: COLUMN agent_runs.confidence; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.confidence IS 'Agent confidence score (0-1)';


--
-- Name: COLUMN agent_runs.intensity; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.intensity IS 'Response intensity (0-1)';


--
-- Name: COLUMN agent_runs.inhibited_by; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON COLUMN public.agent_runs.inhibited_by IS 'Name of agent that inhibited this run';


--
-- Name: integration_passes; Type: TABLE; Schema: public; Owner: soullab
--

CREATE TABLE public.integration_passes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    session_id text,
    turn_id integer,
    user_id text,
    req_id text,
    bridge_agent text NOT NULL,
    inputs jsonb,
    agent_run_ids text,
    integration_method text,
    tensions_named jsonb,
    reconciliations jsonb,
    paradoxes_held jsonb,
    final_text text,
    coherence_score real,
    depth_score real,
    confidence real,
    elemental_mode text,
    origin_route text,
    processing_profile text,
    meta jsonb,
    posture_at_creation text,
    CONSTRAINT integration_passes_posture_valid CHECK (((posture_at_creation IS NULL) OR (posture_at_creation = ANY (ARRAY['normal'::text, 'sanctuary'::text, 'unknown-historical'::text]))))
);


ALTER TABLE public.integration_passes OWNER TO soullab;

--
-- Name: TABLE integration_passes; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON TABLE public.integration_passes IS 'Multi-agent integration pass logs from CorpusCallosum. Tracks tensions, reconciliations, and synthesis quality.';


--
-- Name: memory_transition_records; Type: TABLE; Schema: public; Owner: soullab
--

CREATE TABLE public.memory_transition_records (
    id bigint NOT NULL,
    member_id uuid NOT NULL,
    session_id text,
    source_type text NOT NULL,
    available_count integer,
    retrieved_count integer,
    eligible_count integer,
    offered_count integer,
    injected_count integer,
    selection_policy_version text NOT NULL,
    selection_reasons text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT memory_transition_records_source_type_check CHECK ((source_type = ANY (ARRAY['member_memory_atoms'::text, 'conversational'::text, 'episodic'::text, 'developmental'::text])))
);


ALTER TABLE public.memory_transition_records OWNER TO soullab;

--
-- Name: TABLE memory_transition_records; Type: COMMENT; Schema: public; Owner: soullab
--

COMMENT ON TABLE public.memory_transition_records IS 'Per-turn memory pathway accountability (Sprint 1 Truth Layer): what was available/retrieved/eligible/offered per source, and why — reasons as sentences, never scores. NULL = not measured; unknown is a valid state.';


--
-- Name: memory_transition_records_id_seq; Type: SEQUENCE; Schema: public; Owner: soullab
--

CREATE SEQUENCE public.memory_transition_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.memory_transition_records_id_seq OWNER TO soullab;

--
-- Name: memory_transition_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: soullab
--

ALTER SEQUENCE public.memory_transition_records_id_seq OWNED BY public.memory_transition_records.id;


--
-- Name: memory_transition_records id; Type: DEFAULT; Schema: public; Owner: soullab
--

ALTER TABLE ONLY public.memory_transition_records ALTER COLUMN id SET DEFAULT nextval('public.memory_transition_records_id_seq'::regclass);


--
-- Name: agent_runs agent_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: soullab
--

ALTER TABLE ONLY public.agent_runs
    ADD CONSTRAINT agent_runs_pkey PRIMARY KEY (id);


--
-- Name: integration_passes integration_passes_pkey; Type: CONSTRAINT; Schema: public; Owner: soullab
--

ALTER TABLE ONLY public.integration_passes
    ADD CONSTRAINT integration_passes_pkey PRIMARY KEY (id);


--
-- Name: memory_transition_records memory_transition_records_pkey; Type: CONSTRAINT; Schema: public; Owner: soullab
--

ALTER TABLE ONLY public.memory_transition_records
    ADD CONSTRAINT memory_transition_records_pkey PRIMARY KEY (id);


--
-- Name: idx_agent_runs_agent_name; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_agent_name ON public.agent_runs USING btree (agent_name);


--
-- Name: idx_agent_runs_created_at; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_created_at ON public.agent_runs USING btree (created_at DESC);


--
-- Name: idx_agent_runs_route_profile; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_route_profile ON public.agent_runs USING btree (origin_route, processing_profile, created_at DESC);


--
-- Name: idx_agent_runs_session_id; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_session_id ON public.agent_runs USING btree (session_id);


--
-- Name: idx_agent_runs_status; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_status ON public.agent_runs USING btree (status);


--
-- Name: idx_agent_runs_turn_id; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_agent_runs_turn_id ON public.agent_runs USING btree (turn_id);


--
-- Name: idx_integration_passes_created; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_integration_passes_created ON public.integration_passes USING btree (created_at DESC);


--
-- Name: idx_integration_passes_route_profile; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_integration_passes_route_profile ON public.integration_passes USING btree (origin_route, processing_profile, created_at DESC);


--
-- Name: idx_integration_passes_session; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_integration_passes_session ON public.integration_passes USING btree (session_id);


--
-- Name: idx_memory_transition_records_member_time; Type: INDEX; Schema: public; Owner: soullab
--

CREATE INDEX idx_memory_transition_records_member_time ON public.memory_transition_records USING btree (member_id, created_at DESC);


--
-- Name: agent_runs s5_refuse_tombstoned_trigger; Type: TRIGGER; Schema: public; Owner: soullab
--

CREATE TRIGGER s5_refuse_tombstoned_trigger BEFORE INSERT ON public.agent_runs FOR EACH ROW EXECUTE FUNCTION public.s5_refuse_tombstoned();


--
-- Name: integration_passes s5_refuse_tombstoned_trigger; Type: TRIGGER; Schema: public; Owner: soullab
--

CREATE TRIGGER s5_refuse_tombstoned_trigger BEFORE INSERT ON public.integration_passes FOR EACH ROW EXECUTE FUNCTION public.s5_refuse_tombstoned();


--
-- PostgreSQL database dump complete
--

\unrestrict UO8pB64opy7K13VMsC3SWI4dU3BmpHsBhRealD6vY0CyjmI9dBZjwxffGnfGQ2K

