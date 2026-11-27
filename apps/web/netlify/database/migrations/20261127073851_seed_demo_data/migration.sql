-- Demo data carried over from the original SQLite database.
INSERT INTO "users" ("id", "email", "password_hash", "name", "role", "created_at") VALUES
  ('7c143410-684c-46cc-ac87-ab7f9e59f95a', 'admin@school.com', '$2a$10$GSXjmLttJzYD72PC8z9Vnu83mBxnojYwa8QQ26SVPdTMfje5MJgn6', 'Principal Sarah Jenkins', 'ADMIN', to_timestamp(1782808464923 / 1000.0)),
  ('cbeea033-e8c5-422f-8a9b-81848f879882', 'teacher.john@school.com', '$2a$10$GSXjmLttJzYD72PC8z9VnuOxOitFBjIQTZgMUmwoAMeHkoF.XxNQi', 'John Doe', 'TEACHER', to_timestamp(1782808464984 / 1000.0)),
  ('8071516c-2a64-4f7b-bf2d-bb4648f07e9d', 'teacher.jane@school.com', '$2a$10$GSXjmLttJzYD72PC8z9VnuOxOitFBjIQTZgMUmwoAMeHkoF.XxNQi', 'Jane Smith', 'TEACHER', to_timestamp(1782808465053 / 1000.0)),
  ('93527d38-d3ca-4cf8-8576-9fcb5eb1409f', 'parent@school.com', '$2a$10$GSXjmLttJzYD72PC8z9VnuQ2I8diFFWoiROxbu9n3JO.OS42CZXsK', 'Robert Johnson', 'PARENT', to_timestamp(1782808465122 / 1000.0)),
  ('a6f109f9-3749-42d7-b854-2546144fb91b', 'student.alice@school.com', '$2a$10$GSXjmLttJzYD72PC8z9VnunFV1vam8i4rkw8JJ/NUei4p1HXfwRI6', 'Alice Johnson', 'STUDENT', to_timestamp(1782808465182 / 1000.0)),
  ('6fa1560a-d6a2-45bb-80cf-73deee019541', 'student.charlie@school.com', '$2a$10$GSXjmLttJzYD72PC8z9VnunFV1vam8i4rkw8JJ/NUei4p1HXfwRI6', 'Charlie Johnson', 'STUDENT', to_timestamp(1782808465244 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "teacher_profiles" ("id", "user_id", "employee_id", "department") VALUES
  ('b4ef9312-703a-42b0-aee7-5004e9fbfab3', 'cbeea033-e8c5-422f-8a9b-81848f879882', 'EMP-101', 'Mathematics'),
  ('11b23db4-cc36-418b-b8ca-1dd836183a9d', '8071516c-2a64-4f7b-bf2d-bb4648f07e9d', 'EMP-102', 'Science')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "parent_profiles" ("id", "user_id", "phone") VALUES
  ('60d5ca6c-b00c-48c3-89ba-235e69c90612', '93527d38-d3ca-4cf8-8576-9fcb5eb1409f', '+1 (555) 019-2834')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "classes" ("id", "name", "section", "teacher_id") VALUES
  ('0d208107-f2ee-495d-b5af-b53d493ac185', 'Grade 10', 'A', 'b4ef9312-703a-42b0-aee7-5004e9fbfab3'),
  ('7267a2e8-9bda-45d4-ac6f-678f894ef134', 'Grade 8', 'B', '11b23db4-cc36-418b-b8ca-1dd836183a9d')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "student_profiles" ("id", "user_id", "admission_no", "class_id", "parent_id") VALUES
  ('38f4d30e-789d-4ff9-bd63-9786423c24c9', 'a6f109f9-3749-42d7-b854-2546144fb91b', 'ADM-2026-001', '0d208107-f2ee-495d-b5af-b53d493ac185', '60d5ca6c-b00c-48c3-89ba-235e69c90612'),
  ('421702fe-3a59-4d03-9681-cbffeaf7f96f', '6fa1560a-d6a2-45bb-80cf-73deee019541', 'ADM-2026-002', '7267a2e8-9bda-45d4-ac6f-678f894ef134', '60d5ca6c-b00c-48c3-89ba-235e69c90612')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "subjects" ("id", "name", "code") VALUES
  ('4387a4f5-0f49-412c-918c-6e1c8d72734d', 'Mathematics', 'MATH-101'),
  ('ab138120-0802-43af-93df-633d91d2d7c8', 'General Science', 'SCI-202'),
  ('870da6f4-53ae-4567-8f18-dd5788863d87', 'World History', 'HIST-303')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "attendance" ("id", "student_id", "class_id", "date", "status", "remarks") VALUES
  ('a68f00db-9aba-4411-abf2-8a8389ba69f6', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '0d208107-f2ee-495d-b5af-b53d493ac185', to_timestamp(1782201600000 / 1000.0), 'PRESENT', NULL),
  ('a5cd2bef-3af7-46f9-a652-4f79c7959ec9', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '7267a2e8-9bda-45d4-ac6f-678f894ef134', to_timestamp(1782201600000 / 1000.0), 'PRESENT', NULL),
  ('ba5a75db-045d-4adc-9297-baa0130fcfe0', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '0d208107-f2ee-495d-b5af-b53d493ac185', to_timestamp(1782288000000 / 1000.0), 'PRESENT', NULL),
  ('cc5c1576-9ea8-4d19-9a6e-47564bf923ce', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '7267a2e8-9bda-45d4-ac6f-678f894ef134', to_timestamp(1782288000000 / 1000.0), 'PRESENT', NULL),
  ('9a0b81d7-2cef-4abe-ad17-a57e815c7c91', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '0d208107-f2ee-495d-b5af-b53d493ac185', to_timestamp(1782374400000 / 1000.0), 'PRESENT', NULL),
  ('2808efd1-dcab-4077-a574-f1edc1aafc08', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '7267a2e8-9bda-45d4-ac6f-678f894ef134', to_timestamp(1782374400000 / 1000.0), 'ABSENT', 'Medical leave requested'),
  ('aa1afd69-942e-477d-a6ca-ad311b0abba1', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '0d208107-f2ee-495d-b5af-b53d493ac185', to_timestamp(1782460800000 / 1000.0), 'PRESENT', NULL),
  ('bb6f786e-6732-4821-8c09-ac4c1994899e', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '7267a2e8-9bda-45d4-ac6f-678f894ef134', to_timestamp(1782460800000 / 1000.0), 'PRESENT', NULL),
  ('4bbeb0ff-e543-4c6d-9e1f-13490b76db48', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '0d208107-f2ee-495d-b5af-b53d493ac185', to_timestamp(1782720000000 / 1000.0), 'PRESENT', NULL),
  ('f8361c1d-9335-415c-b13e-74dc0457afc8', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '7267a2e8-9bda-45d4-ac6f-678f894ef134', to_timestamp(1782720000000 / 1000.0), 'PRESENT', NULL)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "marks" ("id", "student_id", "subject_id", "exam_type", "score", "max_score", "date") VALUES
  ('3691b4b3-a426-420e-bc25-fe9bceffd066', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '4387a4f5-0f49-412c-918c-6e1c8d72734d', 'MIDTERM', 88.5, 100, to_timestamp(1778803200000 / 1000.0)),
  ('e5ef7737-be9f-46b0-8d04-76572f11a427', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '4387a4f5-0f49-412c-918c-6e1c8d72734d', 'QUIZ', 18, 20, to_timestamp(1780272000000 / 1000.0)),
  ('218fd29e-6ff2-4079-bfc0-4bbf14bad693', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'ab138120-0802-43af-93df-633d91d2d7c8', 'MIDTERM', 92, 100, to_timestamp(1779062400000 / 1000.0)),
  ('1f12c7dc-844a-4281-9e91-4025603ecb20', '38f4d30e-789d-4ff9-bd63-9786423c24c9', '870da6f4-53ae-4567-8f18-dd5788863d87', 'MIDTERM', 75, 100, to_timestamp(1779235200000 / 1000.0)),
  ('3917d530-de6e-4f4f-91f0-cc3f56454920', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '4387a4f5-0f49-412c-918c-6e1c8d72734d', 'MIDTERM', 72, 100, to_timestamp(1778803200000 / 1000.0)),
  ('a95d8eac-cd02-4202-88df-b6fa9dc76c79', '421702fe-3a59-4d03-9681-cbffeaf7f96f', 'ab138120-0802-43af-93df-633d91d2d7c8', 'MIDTERM', 85, 100, to_timestamp(1779062400000 / 1000.0)),
  ('079900f8-ae5a-444f-975d-cf48b267cf25', '421702fe-3a59-4d03-9681-cbffeaf7f96f', '870da6f4-53ae-4567-8f18-dd5788863d87', 'MIDTERM', 81.5, 100, to_timestamp(1779235200000 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "fee_invoices" ("id", "student_id", "amount", "due_date", "status", "paid_at", "transaction_id", "description") VALUES
  ('030bd78e-9d94-44a4-9d2c-af3ba34e87a3', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 1500, to_timestamp(1777679999000 / 1000.0), 'PAID', to_timestamp(1777372200000 / 1000.0), 'TXN-90284021', 'Term 1 Tuition Fees'),
  ('77377b40-56cc-4256-b860-7a33fc88b702', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 1500, to_timestamp(1788307199000 / 1000.0), 'PAID', to_timestamp(1782810736387 / 1000.0), 'TXN-76488130', 'Term 2 Tuition Fees'),
  ('d153e139-2c41-43e5-a6f5-82c6c417b6c8', '421702fe-3a59-4d03-9681-cbffeaf7f96f', 1200, to_timestamp(1777679999000 / 1000.0), 'PAID', to_timestamp(1777472100000 / 1000.0), 'TXN-90284034', 'Term 1 Tuition Fees'),
  ('45387c75-96b0-4d6b-8653-96672b4969c9', '421702fe-3a59-4d03-9681-cbffeaf7f96f', 1200, to_timestamp(1788307199000 / 1000.0), 'UNPAID', NULL, NULL, 'Term 2 Tuition Fees'),
  ('8930ff13-b872-4b1e-a053-7e7dd9b14487', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 250, to_timestamp(1781567999000 / 1000.0), 'PAID', to_timestamp(1782810732209 / 1000.0), 'TXN-86476289', 'Annual Library & Lab Fees')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "notifications" ("id", "user_id", "title", "message", "is_read", "created_at") VALUES
  ('147a6326-75b3-45ac-8723-47227b2c1fb8', 'a6f109f9-3749-42d7-b854-2546144fb91b', 'Payment Successful', 'Your payment of $250 for Annual Library & Lab Fees was processed successfully (Txn: TXN-86476289).', false, to_timestamp(1782810732219 / 1000.0)),
  ('3ae025cd-c3e3-497e-90ba-8b8f4b2ab916', '93527d38-d3ca-4cf8-8576-9fcb5eb1409f', 'Payment Successful', 'Fee payment of $250 for student Alice Johnson processed successfully (Txn: TXN-86476289).', false, to_timestamp(1782810732227 / 1000.0)),
  ('db7505f4-3736-407d-b691-e766f8e3b1ee', 'a6f109f9-3749-42d7-b854-2546144fb91b', 'Payment Successful', 'Your payment of $1500 for Term 2 Tuition Fees was processed successfully (Txn: TXN-76488130).', false, to_timestamp(1782810736399 / 1000.0)),
  ('a369b14e-8a60-452e-8c0d-a842d2dec498', '93527d38-d3ca-4cf8-8576-9fcb5eb1409f', 'Payment Successful', 'Fee payment of $1500 for student Alice Johnson processed successfully (Txn: TXN-76488130).', false, to_timestamp(1782810736406 / 1000.0)),
  ('a0b8fb20-0450-4e68-bfb5-1826c58c2f98', '7c143410-684c-46cc-ac87-ab7f9e59f95a', '🚨 AI Safety Dispatch', 'Water sensor overflow detected in Block C. Maintenance deployed on autopilot.', false, to_timestamp(1782811123936 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "audit_logs" ("id", "action", "performed_by", "details", "timestamp") VALUES
  ('005a40f7-42a5-4db1-9692-96714676e86b', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1782810462916 / 1000.0)),
  ('23748f52-1be7-4de7-bb60-2e49cc3ecee2', 'INSTALL_APP', 'admin@school.com', 'Installed EduOS package: Asset Lifecycle Auditor', to_timestamp(1782810680477 / 1000.0)),
  ('d938e761-61a1-4462-8ab9-78238363fa24', 'INSTALL_APP', 'admin@school.com', 'Installed EduOS package: Faculty Substitution Matcher', to_timestamp(1782810681130 / 1000.0)),
  ('e4a62ed0-480b-42bd-b04d-3614d6404a82', 'INSTALL_APP', 'admin@school.com', 'Installed EduOS package: Locker Assign Coordinator', to_timestamp(1782810681694 / 1000.0)),
  ('d3c536e0-5e2e-40b3-a36b-4b7afea91e46', 'INSTALL_APP', 'admin@school.com', 'Installed EduOS package: Student Bus Seat Balancer', to_timestamp(1782810682527 / 1000.0)),
  ('b8e87806-4ab1-40f0-9e3f-3f04e8598d72', 'USER_LOGIN', 'parent@school.com', 'Successful login for role PARENT', to_timestamp(1782810725271 / 1000.0)),
  ('a800f6f3-e652-4933-9dfe-f4ce0f22ea50', 'PAY_FEE', 'parent@school.com', 'Processed payment of $250 for Invoice ID 8930ff13-b872-4b1e-a053-7e7dd9b14487. Txn: TXN-86476289', to_timestamp(1782810732234 / 1000.0)),
  ('fcee0474-9dd5-41c7-acc5-1051ee4aa188', 'PAY_FEE', 'parent@school.com', 'Processed payment of $1500 for Invoice ID 77377b40-56cc-4256-b860-7a33fc88b702. Txn: TXN-76488130', to_timestamp(1782810736411 / 1000.0)),
  ('20d59011-915a-4bf6-a119-4f9592d6d0ca', 'USER_LOGIN', 'teacher.john@school.com', 'Successful login for role TEACHER', to_timestamp(1782810771047 / 1000.0)),
  ('c912146a-a0e6-446a-9537-1fb34393e05c', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1782811024378 / 1000.0)),
  ('eefc6d93-d6c1-4eb1-ba04-138cdc451de4', 'REVIEW_QUOTE', 'admin@school.com', 'Procurement quote from Apex Food Services Ltd was rejected', to_timestamp(1782811053783 / 1000.0)),
  ('8c867306-18c5-424d-9580-4b0e44be1ca2', 'AI_TELEMETRY_AUDIT', 'AI_MONITORING_DAEMON', 'Autonomous Telemetry Trace: [Telemetry Scan] Detected anomalies flow leak at Chem Lab. Auto-logged ticket and deployed plumbing crew. | [Safety Dispatch] Broadcasted warning alerts to administrative channels. | [Incident Audit] Student conduct registers clear. No disciplinary escalations required.', to_timestamp(1782811123942 / 1000.0)),
  ('9016c683-c27d-4fc4-9b12-cc003264fb04', 'AI_DIRECT_EXECUTION', 'AI_COMMAND_DIRECTOR', 'Autonomous Execution Trace: [AI Database Inspector] Queried registry indexes. Command "hi" simulated. Trace logs generated.', to_timestamp(1782811129781 / 1000.0)),
  ('233139c0-d9e2-4cd0-b963-ce6886e0e6bf', 'CREATE_EXPENSE', 'admin@school.com', 'Recorded expense of $500 for SUPPLIES: "Chemical Supplies"', to_timestamp(1782811949819 / 1000.0)),
  ('9b4977e4-c515-4dee-a705-94f7e68e1a67', 'UPDATE_MAINTENANCE', 'admin@school.com', 'Updated maintenance ticket status to in_progress for "Science Lab water faucet leakage"', to_timestamp(1782812618603 / 1000.0)),
  ('ec1a1d63-0b31-4c2d-b7ba-c60a268c8e61', 'USER_LOGIN', 'student.alice@school.com', 'Successful login for role STUDENT', to_timestamp(1782817935273 / 1000.0)),
  ('2ce05627-8dec-423a-b775-cbf16c8a497a', 'USER_LOGIN', 'student.alice@school.com', 'Successful login for role STUDENT', to_timestamp(1782817966988 / 1000.0)),
  ('a02b7fec-75d1-4297-9454-ce8ca7fe1809', 'USER_LOGIN', 'teacher.john@school.com', 'Successful login for role TEACHER', to_timestamp(1782817973576 / 1000.0)),
  ('19b0bdcb-9cec-4125-a4b1-2e0fa46d1bef', 'USER_LOGIN', 'parent@school.com', 'Successful login for role PARENT', to_timestamp(1782817976824 / 1000.0)),
  ('fb121006-c902-4c00-b7fc-cd0a5a9452a5', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1782818111679 / 1000.0)),
  ('1a3eac75-c7a7-41c2-a34f-72ca829eb19b', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1782818171065 / 1000.0)),
  ('99a86f50-18fc-4cd5-9989-0616e093c6d3', 'USER_LOGIN', 'student.alice@school.com', 'Successful login for role STUDENT', to_timestamp(1782818213617 / 1000.0)),
  ('4957cb26-3ba3-4b5b-a23c-62cd7534c61c', 'USER_LOGIN', 'teacher.john@school.com', 'Successful login for role TEACHER', to_timestamp(1782818239559 / 1000.0)),
  ('2507a2a8-eb56-43a8-b4e1-20444ff8d85d', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1782818393684 / 1000.0)),
  ('cb47816b-b23c-48f7-a69e-42311004f823', 'UPDATE_MAINTENANCE', 'admin@school.com', 'Updated maintenance ticket status to resolved for "AI AUTOPILOT: Water Leak Alert"', to_timestamp(1782827840925 / 1000.0)),
  ('81f05deb-cad6-43e2-b64a-5ff8bbb44cfc', 'UPDATE_MAINTENANCE', 'admin@school.com', 'Updated maintenance ticket status to resolved for "Broken ceiling fan in Room 3B"', to_timestamp(1782827842145 / 1000.0)),
  ('f5ec9bce-8d99-4aac-83f2-f163b88f874c', 'UPDATE_MAINTENANCE', 'admin@school.com', 'Updated maintenance ticket status to resolved for "Science Lab water faucet leakage"', to_timestamp(1782827845079 / 1000.0)),
  ('6c83ebd7-e180-44a1-9ee1-e6f38eb1bebf', 'USER_LOGIN', 'student.alice@school.com', 'Successful login for role STUDENT', to_timestamp(1782827907692 / 1000.0)),
  ('41be6018-6efa-4838-80e8-bc5e6683e004', 'USER_LOGIN', 'teacher.john@school.com', 'Successful login for role TEACHER', to_timestamp(1782828241285 / 1000.0)),
  ('e32e6c11-c87e-476f-9594-ce43f8d3c069', 'USER_LOGIN', 'admin@school.com', 'Successful login for role ADMIN', to_timestamp(1783484719675 / 1000.0)),
  ('71b1255f-76ee-4e69-9709-6ae830894737', 'USER_LOGIN', 'teacher.john@school.com', 'Successful login for role TEACHER', to_timestamp(1783484742022 / 1000.0)),
  ('98c6b253-9cec-4b1c-a8c6-f51ad290351a', 'USER_LOGIN', 'student.alice@school.com', 'Successful login for role STUDENT', to_timestamp(1783484744556 / 1000.0)),
  ('3ed5e71f-437e-4c12-9052-852ca4172252', 'USER_LOGIN', 'parent@school.com', 'Successful login for role PARENT', to_timestamp(1783484791669 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "badges" ("id", "student_id", "title", "description", "icon", "date_earned") VALUES
  ('d6ce4148-09e7-4b3e-9fe8-1738eb8ae82b', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'Perfect Attendance', 'Maintained 100% presence during this term.', '⭐', to_timestamp(1782808465291 / 1000.0)),
  ('86b2e5ef-a681-473e-a651-080b79e61f29', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'Math Olympiad Gold', 'Secured first place in the regional tournament.', '🏆', to_timestamp(1782808465291 / 1000.0)),
  ('b0eae86a-a6be-4452-87e6-779ff3efef65', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'Lab Master', 'Demonstrated outstanding chemistry lab protocols.', '🧪', to_timestamp(1782808465291 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "disciplinary_records" ("id", "student_id", "title", "description", "status", "date") VALUES
  ('44cb8261-453f-4aef-8dd6-9a618b07f837', '421702fe-3a59-4d03-9681-cbffeaf7f96f', 'Class Distraction', 'Repeatedly speaking during history seminar. Resolved after verbal advisory.', 'RESOLVED', to_timestamp(1782259200000 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "leave_requests" ("id", "teacher_id", "start_date", "end_date", "reason", "status", "created_at") VALUES
  ('f0baac09-f6e0-4857-aec8-d05b09dc6d2a', 'b4ef9312-703a-42b0-aee7-5004e9fbfab3', to_timestamp(1778371200000 / 1000.0), to_timestamp(1778544000000 / 1000.0), 'Family engagement leave', 'APPROVED', to_timestamp(1782808465296 / 1000.0)),
  ('8d78d358-cd01-4f44-b1fd-a42b5aa44427', 'b4ef9312-703a-42b0-aee7-5004e9fbfab3', to_timestamp(1784073600000 / 1000.0), to_timestamp(1784332800000 / 1000.0), 'Routine medical assessment', 'PENDING', to_timestamp(1782808465296 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "lesson_plans" ("id", "teacher_id", "title", "content", "class_name", "subject_name", "created_at") VALUES
  ('d3fc6915-d997-4232-b206-f8007b0587ed', '11b23db4-cc36-418b-b8ca-1dd836183a9d', 'Introduction to Cellular Division & Mitosis', 'Learning objectives:
1. Describe the key differences between mitosis and meiosis.
2. Sketch the stages: Prophase, Metaphase, Anaphase, Telophase.
3. Discuss cell cycle regulation checkpoints.', 'Grade 8', 'General Science', to_timestamp(1782808465298 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "expenses" ("id", "amount", "category", "description", "date") VALUES
  ('672fdf1b-91ca-40d2-9d65-cc94e34a191c', 18500, 'SALARY', 'Monthly payroll processing for all academic staff', to_timestamp(1782808465301 / 1000.0)),
  ('b9eab99a-dc17-4f14-baaf-765690817f6b', 1250, 'UTILITIES', 'Central campus electricity and water utility bills', to_timestamp(1782808465301 / 1000.0)),
  ('fce1f3a2-0349-4ed7-9cec-75d7a70e5a1c', 850, 'MAINTENANCE', 'Air conditioner system maintenance in block C', to_timestamp(1782808465301 / 1000.0)),
  ('f29376fe-0e70-4441-8cf4-abbb33095eef', 430, 'SUPPLIES', 'Office supplies, printing papers, markers, chalks', to_timestamp(1782808465301 / 1000.0)),
  ('747d1828-0b9f-4b8c-a33b-ac4907b0f4d2', 350, 'OTHER', 'Fuel and routine checkup for school transit bus fleet', to_timestamp(1782808465301 / 1000.0)),
  ('5708137d-a336-4a43-a36e-8c2b0d61a360', 500, 'SUPPLIES', 'Chemical Supplies', to_timestamp(1782811949804 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "maintenance_tickets" ("id", "title", "description", "status", "location", "created_at") VALUES
  ('451cd9bc-3fed-4cef-902e-44ee5a3f59b6', 'Broken ceiling fan in Room 3B', 'Regulator speed regulator is unresponsive and fan emits humming sounds.', 'RESOLVED', 'Room 3B, Block A', to_timestamp(1782808465303 / 1000.0)),
  ('2faa9441-7a18-438d-9e5a-b390e55bbc72', 'Science Lab water faucet leakage', 'Drainage pipe under tap 4 is dripping continuously.', 'RESOLVED', 'Chemistry Lab, Block C', to_timestamp(1782808465303 / 1000.0)),
  ('a77a0d18-9661-47e6-a1aa-156c14d8f30f', 'AI AUTOPILOT: Water Leak Alert', 'Autonomous scan detected water pressure telemetry overflow rate at 52 L/min. Autopilot filed ticket and dispatched crew.', 'RESOLVED', 'Block C, Chemistry Lab', to_timestamp(1782811123931 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "cafeteria_orders" ("id", "student_id", "item_names", "total_price", "order_date", "status") VALUES
  ('7864d83c-79f7-40f0-8c43-0edec084d8f0', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'Chicken Burger, Fruit Salad, Apple Juice', 8.5, to_timestamp(1782691200000 / 1000.0), 'DELIVERED'),
  ('b25ea7d0-d5e1-4a81-bb2a-b128ff626c6b', '38f4d30e-789d-4ff9-bd63-9786423c24c9', 'Veggie Salad Bowl, Grilled Chicken Burger, Fresh Apple Juice, Chocolate Muffin', 20.5, to_timestamp(1782828070910 / 1000.0), 'ORDERED')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "events" ("id", "title", "description", "start_date", "end_date", "location") VALUES
  ('bb8b4024-0b7d-46f7-80cb-866ae54eca8f', 'Annual Athletics Meet', 'Inter-house field events and track sprints.', to_timestamp(1783155600000 / 1000.0), to_timestamp(1783184400000 / 1000.0), 'Main School Stadium'),
  ('d67fb5dc-b520-4c3e-8fc9-fba19866c0ff', 'Parent-Teacher Consultations', 'Discuss Term 1 marksheet reports and growth areas.', to_timestamp(1782914400000 / 1000.0), to_timestamp(1782928800000 / 1000.0), 'Auditorium Hall'),
  ('e1ae1df9-a9d7-436a-bc0c-a083429cde1e', 'Science Fair Exhibition', 'Students present robotics and solar system projects.', to_timestamp(1784541600000 / 1000.0), to_timestamp(1784563200000 / 1000.0), 'Exhibition Hall B')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "books" ("id", "title", "author", "barcode", "quantity", "pdf_url") VALUES
  ('c11f49fa-9c0c-4589-91bd-86f40d841070', 'Introduction to Calculus & Analysis', 'Richard Courant', 'BK-CALC-101', 4, '/library/courant_calculus.pdf'),
  ('f639fd29-7186-4c79-be74-3c3bc61cf8b5', 'Fundamentals of General Physics', 'David Halliday', 'BK-PHYS-202', 2, '/library/halliday_physics.pdf'),
  ('fbbd8409-c284-4b1e-8e00-964c06175e7e', 'Biology: The Unity and Diversity of Life', 'Cecie Starr', 'BK-BIO-303', 3, '/library/starr_biology.pdf')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "book_checkouts" ("id", "book_id", "student_id", "checkout_date", "return_date", "status") VALUES
  ('d79f43a9-e0c4-4ca8-9cb6-35c6c4a0609a', 'c11f49fa-9c0c-4589-91bd-86f40d841070', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782817939778 / 1000.0), to_timestamp(1782817940968 / 1000.0), 'RETURNED'),
  ('15fe022b-d611-4c1e-9a00-f89dfd9e27ed', 'c11f49fa-9c0c-4589-91bd-86f40d841070', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782817941828 / 1000.0), to_timestamp(1782828083243 / 1000.0), 'RETURNED'),
  ('94bb237a-5569-4b01-8eb1-14a536bd6b5c', 'c11f49fa-9c0c-4589-91bd-86f40d841070', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782828085168 / 1000.0), NULL, 'ACTIVE'),
  ('a6d80a21-acc3-4b0a-8aac-86be543bbad5', 'f639fd29-7186-4c79-be74-3c3bc61cf8b5', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782828085872 / 1000.0), NULL, 'ACTIVE'),
  ('fd8bf3d7-638d-4546-8f3a-66d0d4b9ba3e', 'fbbd8409-c284-4b1e-8e00-964c06175e7e', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782828086907 / 1000.0), NULL, 'ACTIVE')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "assets" ("id", "name", "barcode", "category", "purchase_date", "cost", "depreciation_rate", "maintenance_schedule") VALUES
  ('5eb32dc2-5248-4789-8635-c53a68997576', 'Dell Latitude 3440 Admin Laptops', 'AST-LAP-901', 'IT', to_timestamp(1705276800000 / 1000.0), 850, 0.2, 'Bi-annual hardware checks'),
  ('ec2bea4e-a345-4f4e-9a0d-d858e094fd17', 'BlueBird Transit Campus Bus Fleet', 'AST-BUS-402', 'FLEET', to_timestamp(1655683200000 / 1000.0), 42000, 0.12, 'Monthly mechanical tuning'),
  ('4b51d42e-531c-46b7-aded-dd3ff0de9a08', 'Polymerase Chain Reaction Lab Machine', 'AST-LAB-303', 'FACILITY', to_timestamp(1739145600000 / 1000.0), 3500, 0.15, 'Annual validation check')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "procurement_quotes" ("id", "vendor_name", "particulars", "amount", "status", "created_at") VALUES
  ('baae7ca7-69e5-4a0f-9a1c-3cb3b3489e7f', 'Apex Food Services Ltd', 'Daily organic cafeteria lunches supply contract', 15400, 'REJECTED', to_timestamp(1782808465315 / 1000.0)),
  ('5c22efc0-46fe-48af-9f0d-fbd09ea6b9fd', 'Global Stationary Wholesale', 'Supply of chalks, whiteboards, paper reams', 2100, 'APPROVED', to_timestamp(1782808465315 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "parent_teacher_meetings" ("id", "parent_id", "teacher_id", "student_id", "date", "time_slot", "status") VALUES
  ('d1bd7cf1-9e52-45f6-9d94-914c1b0cd9f0', '60d5ca6c-b00c-48c3-89ba-235e69c90612', 'b4ef9312-703a-42b0-aee7-5004e9fbfab3', '38f4d30e-789d-4ff9-bd63-9786423c24c9', to_timestamp(1782864000000 / 1000.0), '14:30', 'BOOKED')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "app_packages" ("id", "name", "category", "description", "icon", "is_installed", "config_schema", "created_at") VALUES
  ('a9afb04f-fcb7-442c-8159-089a322a04a6', 'Locker Assign Coordinator', 'LOGISTICS', 'Auto allocation algorithms mapping lockers capacity constraints.', '🔐', true, '[{"label":"Total Cabinet Lockers Available","name":"lockersCount","type":"number","placeholder":"e.g. 150"},{"label":"Warning Capacity Alert Level (%)","name":"threshold","type":"number","placeholder":"e.g. 90"}]', to_timestamp(1782808465320 / 1000.0)),
  ('422e283d-bd9f-4c4e-bb3f-f958f22f6943', 'Student Bus Seat Balancer', 'LOGISTICS', 'Predictive occupancy balancing to optimize bus seating limits.', '🚌', true, '[{"label":"Bus Route Code Reference","name":"routeCode","type":"text","placeholder":"e.g. ROUTE-14B"},{"label":"Maximum Occupancy Cap","name":"maxOccupants","type":"number","placeholder":"e.g. 45"}]', to_timestamp(1782808465320 / 1000.0)),
  ('867fd09f-bdcf-4b3f-947e-df5a3b2eb7da', 'Asset Lifecycle Auditor', 'ERP', 'Calculates asset degradation and mechanical wear-and-tear warnings.', '📈', true, '[{"label":"Expected Useful Life (Years)","name":"usefulLife","type":"number","placeholder":"e.g. 5"},{"label":"Residual salvage value ($)","name":"residualValue","type":"number","placeholder":"e.g. 1000"}]', to_timestamp(1782808465320 / 1000.0)),
  ('fe075667-207a-4adc-a6a8-5a83b2982900', 'Faculty Substitution Matcher', 'ACADEMIC', 'Intelligent substitution scheduler matching teacher availability constraints.', '🧑‍🏫', true, '[{"label":"Emergency Contact Phone","name":"contactPhone","type":"text","placeholder":"+1 (555) 019-2834"}]', to_timestamp(1782808465320 / 1000.0))
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "rbac_policies" ("id", "role", "resource", "can_read", "can_write") VALUES
  ('44f69256-b286-49bf-af06-e764c2073689', 'ADMIN', 'ACADEMICS', true, true),
  ('9eb7935c-c808-409c-afbf-868717dc93b2', 'ADMIN', 'FINANCE', true, true),
  ('8579dcca-2c38-4b45-8982-39a4696ae160', 'ADMIN', 'OPERATIONS', true, true),
  ('1ebaf162-f64e-4a1a-9848-be4b111ef790', 'ADMIN', 'HEALTH', true, true),
  ('0ab45fbe-29e2-443a-b75f-6dc04d5f2646', 'TEACHER', 'ACADEMICS', true, true),
  ('4fc8a881-c9e4-4740-a3f0-0aebedb6bf81', 'TEACHER', 'FINANCE', true, false),
  ('d65d35e6-1b46-4259-9c7a-4142da9565b2', 'TEACHER', 'OPERATIONS', true, false),
  ('e5ce9f6e-b09d-4389-93f9-4cecc9bd36a0', 'TEACHER', 'HEALTH', true, false),
  ('53b8a778-f156-4902-9d43-b12732843598', 'STUDENT', 'ACADEMICS', true, false),
  ('45aa58d9-09d4-4358-b30b-65157e81a556', 'STUDENT', 'FINANCE', false, true),
  ('d35e64f9-6510-4087-bd48-d610ecdd152c', 'STUDENT', 'OPERATIONS', false, true),
  ('637feb93-a77e-4e5a-886c-721f3fccd3c6', 'STUDENT', 'HEALTH', true, false),
  ('9dbd3bf9-e25e-4442-942a-0741468bfb23', 'PARENT', 'ACADEMICS', true, false),
  ('751f86f5-7d16-453e-9ac8-4356cb315804', 'PARENT', 'FINANCE', true, false),
  ('93ebf19a-31dc-450c-badb-5d50ed628721', 'PARENT', 'OPERATIONS', false, false),
  ('9c9825c6-6083-4d0e-909f-4eef57781ad6', 'PARENT', 'HEALTH', true, false)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
