CREATE TABLE `workflow_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_code` text NOT NULL,
	`project_name` text NOT NULL,
	`phase` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text NOT NULL,
	`document_url` text DEFAULT '' NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
