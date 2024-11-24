CREATE TABLE public.users (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	mobile varchar(15) NULL,
	email varchar(100) NOT NULL,
	"password" varchar(100) NULL,
	"role" varchar(50) NOT NULL,
	"schemas" text NULL,
	status varchar(50) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_profile (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	first_name varchar(100) NOT NULL,
	middle_name varchar(100) NULL,
	last_name varchar(100) NULL,
	gender varchar(10) NULL,
	profile_pic text NULL,
	occupation varchar(100) NULL,
	relationship_status varchar(50) NULL,
	date_of_birth date NULL,
	city varchar(100) NULL,
	state varchar(100) NULL,
	country varchar(100) NULL,
	zip_code varchar(10) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_profile_hashid_key UNIQUE (hashid),
	CONSTRAINT user_profile_pkey PRIMARY KEY (id)
);


CREATE TABLE public.bookings (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	user_id varchar(50) NOT NULL,
	mobile varchar(15) NULL,
    counselor_id varchar(50) NOT NULL,
	slot_id varchar(50) NOT NULL,
	booking_date date NULL,
	fees numeric(10, 2) NOT NULL,
	problem_category varchar(100) NULL,
	"language" varchar(50) NULL,
	message text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	status varchar(50) DEFAULT 'pending'::character varying NULL,
	meeting_link varchar(255) NULL,
	razorpay_payment_id varchar(255) NULL,
	razorpay_order_id varchar(255) NULL,
	CONSTRAINT bookings_hashid_key UNIQUE (hashid),
	CONSTRAINT bookings_pkey PRIMARY KEY (id)
);




CREATE TABLE public.contactform (
	id serial4 NOT NULL,
	hashid varchar(64) NOT NULL,
	"name" varchar(100) NOT NULL,
	email varchar(100) NOT NULL,
	message text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT contactform_hashid_key UNIQUE (hashid),
	CONSTRAINT contactform_pkey PRIMARY KEY (id)
);



CREATE TABLE public.counselorcategories (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	category_name varchar(100) NOT NULL,
	status varchar(50) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT categories_category_name_key UNIQUE (category_name),
	CONSTRAINT counselorcategories_hashid_key UNIQUE (hashid),
	CONSTRAINT counselorcategories_pkey PRIMARY KEY (id)
);



CREATE TABLE public.counselorprofile (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	first_name varchar(100) NOT NULL,
	middle_name varchar(100) NULL,
	last_name varchar(100) NOT NULL,
	gender varchar(10) NULL,
	specialist varchar(255) NULL,
	age int4 NULL,
	languages varchar(250) NULL,
	marital_status varchar(100) NULL,
	experience int4 NULL,
	price numeric(10, 2) NULL,
	original_price numeric(10, 2) NULL,
	education varchar(100) NULL,
	occupation varchar(100) NULL,
	profile_pic text NULL,
	description text NULL,
	heading text NULL,
	start_date date NULL,
	end_date date NULL,
	city varchar(100) NULL,
	state varchar(100) NULL,
	country varchar(100) NULL,
	zip_code varchar(10) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	categories text NULL,
	CONSTRAINT counselor_profile_hashid_key UNIQUE (hashid),
	CONSTRAINT counselor_profile_pkey PRIMARY KEY (id)
);


CREATE TABLE public.time_slots (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	counselor_id varchar(50) NOT NULL,
	slot_date date NOT NULL,
    slot_time varchar NOT NULL,
	status varchar(20) DEFAULT 'available'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT counselor_hashid_key UNIQUE (hashid),
	CONSTRAINT time_slots_pkey PRIMARY KEY (id),
	CONSTRAINT unique_time_slot_per_counselor UNIQUE (counselor_id, slot_date, slot_time)
);






CREATE TABLE public.testcategories (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	category_name varchar(255) NOT NULL,
	description text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT testcategories_hashid_key UNIQUE (hashid),
	CONSTRAINT testcategories_pkey PRIMARY KEY (id),
	CONSTRAINT unique_category_name UNIQUE (category_name)
);


CREATE TABLE public.tests (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	category_hashid varchar(50) NOT NULL,
	test_name varchar(255) NOT NULL,
	description text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tests_hashid_key UNIQUE (hashid),
	CONSTRAINT tests_pkey PRIMARY KEY (id),
	CONSTRAINT unique_test_name UNIQUE (test_name)
);





CREATE TABLE public.questions (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	test_hashid varchar(50) NOT NULL,
	question_text text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT questions_hashid_key UNIQUE (hashid),
	CONSTRAINT questions_pkey PRIMARY KEY (id)
);

CREATE TABLE public."options" (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	question_hashid varchar(50) NOT NULL,
	option_text text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT options_hashid_key UNIQUE (hashid),
	CONSTRAINT options_pkey PRIMARY KEY (id)
);


CREATE TABLE public.suggested_test (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	booking_id varchar(50) NOT NULL,
	user_id varchar(50) NOT NULL,
	testcategory_id varchar(50) NULL,
	test_id varchar(50) NULL,
	status varchar(50) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT suggest_test_hashid_key UNIQUE (hashid),
	CONSTRAINT suggest_test_pkey PRIMARY KEY (id)
);

CREATE TABLE public.user_tests (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	user_hashid varchar(50) NOT NULL,
	test_hashid varchar(50) NOT NULL,
	suggested_test_id varchar(50) NULL,
	submitted_at timestamp NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT user_tests_hashid_key UNIQUE (hashid),
	CONSTRAINT user_tests_pkey PRIMARY KEY (id)
);


CREATE TABLE public.user_answers (
	id serial4 NOT NULL,
	hashid varchar(50) NOT NULL,
	user_test_hashid varchar(50) NOT NULL,
	question_hashid varchar(50) NOT NULL,
	option_hashid varchar(50) NOT NULL,
	answered_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	suggestedtesthashid varchar(50) NULL,
	CONSTRAINT user_answers_hashid_key UNIQUE (hashid),
	CONSTRAINT user_answers_pkey PRIMARY KEY (id)
);
