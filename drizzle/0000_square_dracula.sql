CREATE TABLE `cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`input_text` text NOT NULL,
	`input_signal` text NOT NULL,
	`state_byte` integer NOT NULL,
	`active_currents` text NOT NULL,
	`interactions` text NOT NULL,
	`final_valve` text NOT NULL,
	`response` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cycles_created_at_idx` ON `cycles` (`created_at`);