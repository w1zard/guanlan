CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feed_id` text NOT NULL,
	`source` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`time_label` text DEFAULT '' NOT NULL,
	`unread` integer DEFAULT true NOT NULL,
	`starred` integer DEFAULT false NOT NULL,
	`tag` text,
	`accent` text DEFAULT 'RSS' NOT NULL,
	`en_source` text DEFAULT '' NOT NULL,
	`en_title` text DEFAULT '' NOT NULL,
	`en_excerpt` text DEFAULT '' NOT NULL,
	`en_content` text DEFAULT '' NOT NULL,
	`en_time` text DEFAULT '' NOT NULL,
	`en_tag` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`color` text DEFAULT '#174f3d' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feeds_url_unique` ON `feeds` (`url`);