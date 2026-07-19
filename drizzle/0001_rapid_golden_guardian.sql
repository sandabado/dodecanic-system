CREATE TABLE `current_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`house_a` integer NOT NULL,
	`house_b` integer NOT NULL,
	`edge_protocol` text NOT NULL,
	`current_a` text NOT NULL,
	`current_b` text NOT NULL,
	`interaction_type` text NOT NULL,
	`valve_action` text,
	`observer_note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `current_interactions_edge_idx` ON `current_interactions` (`house_a`,`house_b`);--> statement-breakpoint
CREATE TABLE `decision_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text DEFAULT 'local' NOT NULL,
	`house_id` integer NOT NULL,
	`timestamp` text NOT NULL,
	`master_role` text,
	`mirror_role` text,
	`root_role` text,
	`position9_witness` text,
	`intent_statement` text NOT NULL,
	`challenges_raised` text DEFAULT '[]' NOT NULL,
	`final_decision` text NOT NULL,
	`decision_outcome` text NOT NULL,
	`pre_decision_coherence` real,
	`post_decision_coherence` real,
	`created_at` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house_states`(`house_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `edge_states` (
	`id` text PRIMARY KEY NOT NULL,
	`house_a` integer NOT NULL,
	`house_b` integer NOT NULL,
	`current_type` text,
	`valve_status` text DEFAULT 'OPEN' NOT NULL,
	`last_incident` text,
	`incident_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`house_a`) REFERENCES `house_states`(`house_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`house_b`) REFERENCES `house_states`(`house_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `edge_states_houses_idx` ON `edge_states` (`house_a`,`house_b`);--> statement-breakpoint
CREATE TABLE `house_states` (
	`house_id` integer PRIMARY KEY NOT NULL,
	`house_name` text NOT NULL,
	`valve_status` text DEFAULT 'OPEN' NOT NULL,
	`quincunx_alignment` text NOT NULL,
	`coherence_score` real DEFAULT 0 NOT NULL,
	`last_compromised` text,
	`breach_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `immune_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`compromised_house` integer NOT NULL,
	`severity` text NOT NULL,
	`safe_houses` text DEFAULT '[]' NOT NULL,
	`monitoring_houses` text DEFAULT '[]' NOT NULL,
	`acknowledged` integer DEFAULT false NOT NULL,
	`acknowledged_by` text,
	`acknowledged_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`compromised_house`) REFERENCES `house_states`(`house_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `immune_alerts_severity_idx` ON `immune_alerts` (`severity`,`acknowledged`);--> statement-breakpoint
CREATE TABLE `quincunx_readings` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text DEFAULT 'local' NOT NULL,
	`timestamp` text NOT NULL,
	`hrv_physical` integer NOT NULL,
	`hrv_mental` integer NOT NULL,
	`hrv_emotional` integer NOT NULL,
	`hrv_spiritual` integer NOT NULL,
	`stress_physical` integer NOT NULL,
	`stress_mental` integer NOT NULL,
	`stress_emotional` integer NOT NULL,
	`stress_spiritual` integer NOT NULL,
	`coherence_physical` real NOT NULL,
	`coherence_mental` real NOT NULL,
	`coherence_emotional` real NOT NULL,
	`coherence_spiritual` real NOT NULL,
	`overall_coherence` real NOT NULL,
	`valve_status` text NOT NULL,
	`position9_active` integer DEFAULT true NOT NULL,
	`position9_bias` text,
	`house_id` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`house_id`) REFERENCES `house_states`(`house_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quincunx_readings_session_time_idx` ON `quincunx_readings` (`session_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `quincunx_readings_coherence_idx` ON `quincunx_readings` (`overall_coherence`);--> statement-breakpoint
CREATE TABLE `signal_patterns` (
	`id` text PRIMARY KEY NOT NULL,
	`text_pattern` text NOT NULL,
	`expected_currents` text DEFAULT '[]' NOT NULL,
	`confidence_score` real,
	`breach_count` integer DEFAULT 0 NOT NULL,
	`last_seen` text,
	`created_at` text NOT NULL
);
