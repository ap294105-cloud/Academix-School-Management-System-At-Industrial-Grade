CREATE TABLE "announcement_feedback" (
	"id" text PRIMARY KEY,
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_role" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_instances" (
	"id" text PRIMARY KEY,
	"package_id" text NOT NULL,
	"config_data" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_packages" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"is_installed" boolean DEFAULT false NOT NULL,
	"config_schema" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"barcode" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"purchase_date" timestamp with time zone NOT NULL,
	"cost" double precision NOT NULL,
	"depreciation_rate" double precision NOT NULL,
	"maintenance_schedule" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_submissions" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"title" text NOT NULL,
	"file_path" text NOT NULL,
	"match_rate" double precision NOT NULL,
	"ai_rate" double precision NOT NULL,
	"report" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"class_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"action" text NOT NULL,
	"performed_by" text NOT NULL,
	"details" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"date_earned" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biometric_logs" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"gate" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_checkouts" (
	"id" text PRIMARY KEY,
	"book_id" text NOT NULL,
	"student_id" text NOT NULL,
	"checkout_date" timestamp with time zone DEFAULT now() NOT NULL,
	"return_date" timestamp with time zone,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"barcode" text NOT NULL UNIQUE,
	"quantity" integer DEFAULT 1 NOT NULL,
	"pdf_url" text
);
--> statement-breakpoint
CREATE TABLE "cafeteria_orders" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"item_names" text NOT NULL,
	"total_price" double precision NOT NULL,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"section" text NOT NULL,
	"teacher_id" text
);
--> statement-breakpoint
CREATE TABLE "disciplinary_incidents" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"severity" text NOT NULL,
	"description" text NOT NULL,
	"action_taken" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disciplinary_records" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"location" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY,
	"amount" double precision NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_invoices" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"amount" double precision NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"paid_at" timestamp with time zone,
	"transaction_id" text,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_plans" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"class_name" text NOT NULL,
	"subject_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_tickets" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"location" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marks" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"exam_type" text NOT NULL,
	"score" double precision NOT NULL,
	"max_score" double precision NOT NULL,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" text PRIMARY KEY,
	"student_id" text NOT NULL UNIQUE,
	"allergies" text NOT NULL,
	"medical_history" text NOT NULL,
	"immunization_checks" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_profiles" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"phone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_teacher_meetings" (
	"id" text PRIMARY KEY,
	"parent_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"student_id" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"time_slot" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procurement_quotes" (
	"id" text PRIMARY KEY,
	"vendor_name" text NOT NULL,
	"particulars" text NOT NULL,
	"amount" double precision NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_developments" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"course_title" text NOT NULL,
	"credits_earned" integer NOT NULL,
	"completion_date" timestamp with time zone NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY,
	"quiz_id" text NOT NULL,
	"question" text NOT NULL,
	"options" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"class_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rbac_policies" (
	"id" text PRIMARY KEY,
	"role" text NOT NULL,
	"resource" text NOT NULL,
	"can_read" boolean DEFAULT true NOT NULL,
	"can_write" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_requisitions" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"estimated_cost" double precision NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"admission_no" text NOT NULL UNIQUE,
	"class_id" text,
	"parent_id" text
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"code" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "syllabi" (
	"id" text PRIMARY KEY,
	"teacher_id" text NOT NULL,
	"title" text NOT NULL,
	"grade" text NOT NULL,
	"weeks" integer DEFAULT 30 NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"employee_id" text NOT NULL UNIQUE,
	"department" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcement_feedback" ADD CONSTRAINT "announcement_feedback_announcement_id_announcements_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "announcement_feedback" ADD CONSTRAINT "announcement_feedback_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_instances" ADD CONSTRAINT "app_instances_package_id_app_packages_id_fkey" FOREIGN KEY ("package_id") REFERENCES "app_packages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_id_classes_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "biometric_logs" ADD CONSTRAINT "biometric_logs_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "book_checkouts" ADD CONSTRAINT "book_checkouts_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "book_checkouts" ADD CONSTRAINT "book_checkouts_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cafeteria_orders" ADD CONSTRAINT "cafeteria_orders_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id");--> statement-breakpoint
ALTER TABLE "disciplinary_incidents" ADD CONSTRAINT "disciplinary_incidents_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "disciplinary_incidents" ADD CONSTRAINT "disciplinary_incidents_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "disciplinary_records" ADD CONSTRAINT "disciplinary_records_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "marks" ADD CONSTRAINT "marks_subject_id_subjects_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_teacher_meetings" ADD CONSTRAINT "parent_teacher_meetings_parent_id_parent_profiles_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_teacher_meetings" ADD CONSTRAINT "parent_teacher_meetings_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "parent_teacher_meetings" ADD CONSTRAINT "parent_teacher_meetings_student_id_student_profiles_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "professional_developments" ADD CONSTRAINT "professional_developments_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_quizzes_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_class_id_classes_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resource_requisitions" ADD CONSTRAINT "resource_requisitions_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_class_id_classes_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id");--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_parent_id_parent_profiles_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parent_profiles"("id");--> statement-breakpoint
ALTER TABLE "syllabi" ADD CONSTRAINT "syllabi_teacher_id_teacher_profiles_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;