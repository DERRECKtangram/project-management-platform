DELETE FROM `workflow_items`
WHERE `project_code` IN ('GA-2026-014', 'GA-2026-019', 'GA-2026-006', 'GA-2025-031')
   OR `id` LIKE 'WF-SEED-%';
--> statement-breakpoint
DELETE FROM `action_items`;
--> statement-breakpoint
DELETE FROM `documents`;
--> statement-breakpoint
DELETE FROM `meeting_records`;
--> statement-breakpoint
DELETE FROM `gate_steps`;
--> statement-breakpoint
DELETE FROM `projects`
WHERE `code` IN ('GA-2026-014', 'GA-2026-019', 'GA-2026-006', 'GA-2025-031');
--> statement-breakpoint
DELETE FROM `members`;
