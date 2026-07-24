CREATE TABLE `action_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`title` text NOT NULL,
	`assignee` text NOT NULL,
	`role` text NOT NULL,
	`source_meeting` text NOT NULL,
	`due` text NOT NULL,
	`status` text NOT NULL,
	`gate` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`project` text NOT NULL,
	`gate` text NOT NULL,
	`status` text NOT NULL,
	`owner` text NOT NULL,
	`updated` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gate_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`gate` text NOT NULL,
	`color` text NOT NULL,
	`step` text NOT NULL,
	`title` text NOT NULL,
	`mission` text NOT NULL,
	`condition` text NOT NULL,
	`benefit` text NOT NULL,
	`next` text NOT NULL,
	`owner` text NOT NULL,
	`assignee` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meeting_records` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`project` text NOT NULL,
	`date` text NOT NULL,
	`chair` text NOT NULL,
	`attendees` text NOT NULL,
	`decisions` text NOT NULL,
	`risks` text NOT NULL,
	`next_review` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`team` text NOT NULL,
	`focus` text NOT NULL,
	`assigned` integer DEFAULT 0 NOT NULL,
	`overdue` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`agency` text NOT NULL,
	`manager` text NOT NULL,
	`developers` text NOT NULL,
	`stage` text NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`risk` text NOT NULL,
	`due` text NOT NULL,
	`budget` text NOT NULL,
	`next_action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
