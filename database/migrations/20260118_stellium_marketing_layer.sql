-- STELLIUM MARKETING LAYER
-- Pro marketing automation for practitioners
-- "Your voice, amplified. Your presence, consistent. Your practice, growing."
--
-- Run with: psql -d maia_consciousness -f database/migrations/20260118_stellium_marketing_layer.sql

-- ============================================
-- MARKETING CONTACTS (Leads & Prospects)
-- ============================================
-- Separate from clients - these are people in your funnel

CREATE TABLE IF NOT EXISTS marketing_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Contact info
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),

    -- Source tracking
    source VARCHAR(50) DEFAULT 'organic', -- organic, referral, ad, lead_magnet, webinar, social
    source_detail TEXT, -- specific campaign, referrer name, etc.
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Status
    status VARCHAR(30) DEFAULT 'lead', -- lead, engaged, qualified, opportunity, converted, unsubscribed
    lead_score INTEGER DEFAULT 0,

    -- Engagement tracking
    emails_received INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    last_email_at TIMESTAMPTZ,
    last_opened_at TIMESTAMPTZ,
    last_clicked_at TIMESTAMPTZ,

    -- Conversion tracking
    converted_to_client_id UUID REFERENCES practitioner_clients(id),
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(10, 2),

    -- Tags for segmentation
    tags TEXT[] DEFAULT '{}',

    -- Optional astrology data (for astrologers)
    birth_data JSONB, -- { date, time, location } if provided

    -- Consent & compliance
    email_consent BOOLEAN DEFAULT true,
    consent_timestamp TIMESTAMPTZ,
    consent_source VARCHAR(100), -- form name, lead magnet, etc.

    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(practitioner_id, email)
);

CREATE INDEX idx_marketing_contacts_practitioner ON marketing_contacts(practitioner_id);
CREATE INDEX idx_marketing_contacts_status ON marketing_contacts(status);
CREATE INDEX idx_marketing_contacts_email ON marketing_contacts(email);
CREATE INDEX idx_marketing_contacts_tags ON marketing_contacts USING GIN(tags);


-- ============================================
-- EMAIL TEMPLATES
-- ============================================
-- Reusable email templates with MAIA voice

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Template info
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- welcome, nurture, promo, follow_up, transit_alert, newsletter
    subject VARCHAR(500) NOT NULL,
    preview_text VARCHAR(200),

    -- Content
    body_html TEXT NOT NULL,
    body_text TEXT, -- Plain text version

    -- MAIA generation
    generated_by_maia BOOLEAN DEFAULT false,
    maia_prompt TEXT, -- Original prompt used to generate
    voice_match_score DECIMAL(3, 2), -- How well it matches practitioner voice (0-1)

    -- Personalization tokens
    -- Available: {{first_name}}, {{last_name}}, {{birth_sun_sign}}, {{current_transits}}, etc.
    personalization_tokens TEXT[] DEFAULT '{}',

    -- Design
    template_theme VARCHAR(50) DEFAULT 'minimal', -- Uses Stellium design themes

    -- Stats (when used in campaigns)
    times_used INTEGER DEFAULT 0,
    avg_open_rate DECIMAL(5, 2),
    avg_click_rate DECIMAL(5, 2),

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_practitioner ON email_templates(practitioner_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);


-- ============================================
-- MARKETING CAMPAIGNS
-- ============================================
-- Email sequences and one-off campaigns

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Campaign info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL, -- sequence, broadcast, automation, transit_alert

    -- Targeting
    target_segment JSONB, -- { status: ['lead'], tags: ['interested_in_readings'], etc. }
    estimated_recipients INTEGER,

    -- Sequence settings (for type=sequence)
    sequence_emails JSONB, -- [{ order: 1, template_id, delay_days, delay_hours }]

    -- Broadcast settings (for type=broadcast)
    send_at TIMESTAMPTZ, -- Scheduled send time
    template_id UUID REFERENCES email_templates(id),

    -- Automation trigger (for type=automation)
    trigger_type VARCHAR(50), -- signup, tag_added, no_open_7_days, birthday, transit
    trigger_config JSONB,

    -- Transit alert settings (for type=transit_alert)
    transit_config JSONB, -- { planet, aspect, frequency }

    -- Status & metrics
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, active, paused, completed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Campaign metrics
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_campaigns_practitioner ON marketing_campaigns(practitioner_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(type);


-- ============================================
-- CAMPAIGN SENDS (Individual email sends)
-- ============================================
-- Track each email sent in a campaign

CREATE TABLE IF NOT EXISTS campaign_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES marketing_contacts(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id),

    -- Sequence position (for sequence campaigns)
    sequence_step INTEGER,

    -- Send info
    sent_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,

    -- Delivery status
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
    bounce_type VARCHAR(20), -- hard, soft
    error_message TEXT,

    -- Engagement tracking
    opened_at TIMESTAMPTZ,
    open_count INTEGER DEFAULT 0,
    clicked_at TIMESTAMPTZ,
    click_count INTEGER DEFAULT 0,
    clicked_links TEXT[], -- URLs clicked

    -- Unsubscribe
    unsubscribed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_contact ON campaign_sends(contact_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(status);
CREATE INDEX idx_campaign_sends_scheduled ON campaign_sends(scheduled_for);


-- ============================================
-- LEAD MAGNETS
-- ============================================
-- Free offerings to capture leads

CREATE TABLE IF NOT EXISTS lead_magnets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Lead magnet info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30), -- pdf, video, audio, mini_course, quiz, calculator, transit_report

    -- Content
    content_url TEXT, -- URL to downloadable content
    landing_page_config JSONB, -- Page design settings
    thank_you_config JSONB, -- Thank you page/redirect settings

    -- Form fields
    required_fields TEXT[] DEFAULT '{email}', -- email, first_name, birth_date, etc.
    optional_fields TEXT[] DEFAULT '{}',

    -- Automation
    auto_tag TEXT[], -- Tags to add when someone opts in
    follow_up_campaign_id UUID REFERENCES marketing_campaigns(id),

    -- Stats
    page_views INTEGER DEFAULT 0,
    submissions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5, 2),

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, archived

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_magnets_practitioner ON lead_magnets(practitioner_id);
CREATE INDEX idx_lead_magnets_status ON lead_magnets(status);


-- ============================================
-- LEAD MAGNET SUBMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS lead_magnet_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES marketing_contacts(id),

    -- Submitted data
    email VARCHAR(255) NOT NULL,
    form_data JSONB, -- All submitted fields

    -- Tracking
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Status
    content_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_magnet_submissions_magnet ON lead_magnet_submissions(lead_magnet_id);


-- ============================================
-- SOCIAL CONTENT
-- ============================================
-- MAIA-generated social media content

CREATE TABLE IF NOT EXISTS social_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Content info
    platform VARCHAR(30), -- instagram, facebook, linkedin, twitter, threads
    content_type VARCHAR(30), -- post, story, carousel, reel_script, thread

    -- Content
    content_text TEXT NOT NULL,
    hashtags TEXT[],
    media_urls TEXT[], -- Images/videos to accompany
    carousel_slides JSONB, -- For carousel posts

    -- MAIA generation
    generated_by_maia BOOLEAN DEFAULT false,
    maia_prompt TEXT,
    voice_match_score DECIMAL(3, 2),
    topic VARCHAR(100), -- What the post is about
    content_pillar VARCHAR(50), -- educational, inspirational, promotional, personal, seasonal

    -- Transit-based content (for astrologers)
    transit_context JSONB, -- { planet, sign, aspect, interpretation }

    -- Scheduling
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, published, archived

    -- Engagement (if connected)
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    saves INTEGER,
    reach INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_content_practitioner ON social_content(practitioner_id);
CREATE INDEX idx_social_content_platform ON social_content(platform);
CREATE INDEX idx_social_content_status ON social_content(status);
CREATE INDEX idx_social_content_scheduled ON social_content(scheduled_for);


-- ============================================
-- BOOKING FUNNELS
-- ============================================
-- Sales funnels for services

CREATE TABLE IF NOT EXISTS booking_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Funnel info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Service being sold
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    service_price DECIMAL(10, 2),
    service_duration_minutes INTEGER,

    -- Funnel pages
    pages JSONB, -- [{ order, type: 'landing'|'upsell'|'checkout'|'thank_you', config }]

    -- Integration
    calendar_integration VARCHAR(50), -- calendly, acuity, google, none
    calendar_link TEXT,

    -- Stats
    page_views INTEGER DEFAULT 0,
    add_to_carts INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, archived

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_funnels_practitioner ON booking_funnels(practitioner_id);
CREATE INDEX idx_booking_funnels_status ON booking_funnels(status);


-- ============================================
-- TRANSIT ALERTS (Astrology-specific)
-- ============================================
-- Automated alerts based on planetary transits

CREATE TABLE IF NOT EXISTS transit_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Alert configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Transit trigger
    transiting_planet VARCHAR(20) NOT NULL, -- sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto
    natal_planet VARCHAR(20), -- Planet in natal chart to aspect (null = sign ingress)
    aspect_type VARCHAR(20), -- conjunction, opposition, trine, square, sextile, ingress
    target_sign VARCHAR(20), -- For ingress alerts
    orb_degrees DECIMAL(3, 1) DEFAULT 1.0,

    -- Content
    email_template_id UUID REFERENCES email_templates(id),
    social_content_template TEXT, -- Template for social post

    -- Targeting
    target_segment JSONB, -- Who gets this alert
    send_to_natal_affected BOOLEAN DEFAULT true, -- Only contacts with this placement

    -- Schedule
    advance_notice_days INTEGER DEFAULT 3, -- Days before exact

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, paused
    last_triggered_at TIMESTAMPTZ,
    times_triggered INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transit_alerts_practitioner ON transit_alerts(practitioner_id);
CREATE INDEX idx_transit_alerts_status ON transit_alerts(status);


-- ============================================
-- MARKETING ANALYTICS
-- ============================================
-- Aggregated marketing metrics

CREATE TABLE IF NOT EXISTS marketing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Time period
    period_type VARCHAR(10) NOT NULL, -- day, week, month
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Lead metrics
    new_contacts INTEGER DEFAULT 0,
    contacts_by_source JSONB, -- { organic: 5, referral: 3, ad: 2 }
    contacts_converted INTEGER DEFAULT 0,

    -- Email metrics
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,

    -- Social metrics
    posts_published INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,

    -- Revenue metrics
    bookings INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,

    -- Calculated metrics
    open_rate DECIMAL(5, 2),
    click_rate DECIMAL(5, 2),
    conversion_rate DECIMAL(5, 2),
    revenue_per_contact DECIMAL(10, 2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(practitioner_id, period_type, period_start)
);

CREATE INDEX idx_marketing_analytics_practitioner ON marketing_analytics(practitioner_id);
CREATE INDEX idx_marketing_analytics_period ON marketing_analytics(period_type, period_start);


-- ============================================
-- AUTOMATION WORKFLOWS
-- ============================================
-- Complex multi-step automation flows

CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Workflow info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Trigger
    trigger_type VARCHAR(50) NOT NULL, -- new_contact, tag_added, form_submitted, no_engagement, birthday, transit, manual
    trigger_config JSONB,

    -- Steps
    steps JSONB NOT NULL, -- [{ order, type, config, delay }]
    -- Step types: send_email, add_tag, remove_tag, update_field, notify_practitioner, wait, condition

    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused

    -- Metrics
    contacts_entered INTEGER DEFAULT 0,
    contacts_completed INTEGER DEFAULT 0,
    contacts_active INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_workflows_practitioner ON automation_workflows(practitioner_id);
CREATE INDEX idx_automation_workflows_status ON automation_workflows(status);


-- ============================================
-- WORKFLOW ENROLLMENTS
-- ============================================
-- Track contacts in workflows

CREATE TABLE IF NOT EXISTS workflow_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES marketing_contacts(id) ON DELETE CASCADE,

    -- Current position
    current_step INTEGER DEFAULT 0,
    next_action_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, exited

    -- History
    steps_completed JSONB DEFAULT '[]', -- [{ step, completed_at, result }]

    entered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    exited_at TIMESTAMPTZ,
    exit_reason VARCHAR(100),

    UNIQUE(workflow_id, contact_id)
);

CREATE INDEX idx_workflow_enrollments_workflow ON workflow_enrollments(workflow_id);
CREATE INDEX idx_workflow_enrollments_contact ON workflow_enrollments(contact_id);
CREATE INDEX idx_workflow_enrollments_status ON workflow_enrollments(status);
CREATE INDEX idx_workflow_enrollments_next_action ON workflow_enrollments(next_action_at);


-- ============================================
-- CONTENT CALENDAR
-- ============================================
-- Planning and scheduling content

CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- Calendar entry
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Content link
    content_type VARCHAR(30), -- email, social, blog, video
    content_id UUID, -- Reference to actual content

    -- Scheduling
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,

    -- Planning
    status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, ready, published

    -- Organization
    color VARCHAR(20) DEFAULT '#6B7280', -- For calendar display
    tags TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_calendar_practitioner ON content_calendar(practitioner_id);
CREATE INDEX idx_content_calendar_date ON content_calendar(scheduled_date);


-- ============================================
-- FUNCTIONS
-- ============================================

-- Update contact engagement score
CREATE OR REPLACE FUNCTION update_contact_lead_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple scoring: +1 for open, +2 for click
    UPDATE marketing_contacts
    SET lead_score = lead_score + CASE
        WHEN NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN 2
        WHEN NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN 1
        ELSE 0
    END,
    updated_at = NOW()
    WHERE id = NEW.contact_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
    AFTER UPDATE ON campaign_sends
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_lead_score();


-- Update contact email stats
CREATE OR REPLACE FUNCTION update_contact_email_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'sent' THEN
        UPDATE marketing_contacts
        SET emails_received = emails_received + 1,
            last_email_at = NEW.sent_at,
            updated_at = NOW()
        WHERE id = NEW.contact_id;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
            UPDATE marketing_contacts
            SET emails_opened = emails_opened + 1,
                last_opened_at = NEW.opened_at,
                updated_at = NOW()
            WHERE id = NEW.contact_id;
        END IF;

        IF NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN
            UPDATE marketing_contacts
            SET emails_clicked = emails_clicked + 1,
                last_clicked_at = NEW.clicked_at,
                updated_at = NOW()
            WHERE id = NEW.contact_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_email_stats
    AFTER INSERT OR UPDATE ON campaign_sends
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_email_stats();


-- Update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketing_campaigns
    SET
        emails_sent = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND status = 'sent'),
        emails_delivered = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND status = 'delivered'),
        emails_opened = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
        emails_clicked = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL),
        unsubscribes = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND unsubscribed_at IS NOT NULL),
        updated_at = NOW()
    WHERE id = NEW.campaign_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_metrics
    AFTER INSERT OR UPDATE ON campaign_sends
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_metrics();


-- ============================================
-- GRANTS (if needed for roles)
-- ============================================
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_role;

COMMENT ON TABLE marketing_contacts IS 'Leads and prospects separate from active clients';
COMMENT ON TABLE email_templates IS 'Reusable email templates with MAIA voice matching';
COMMENT ON TABLE marketing_campaigns IS 'Email sequences, broadcasts, and automated campaigns';
COMMENT ON TABLE lead_magnets IS 'Free offerings to capture leads';
COMMENT ON TABLE social_content IS 'MAIA-generated social media content';
COMMENT ON TABLE transit_alerts IS 'Automated marketing based on astrological transits';
COMMENT ON TABLE automation_workflows IS 'Multi-step marketing automation flows';
