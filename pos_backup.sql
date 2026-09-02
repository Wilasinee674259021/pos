--
-- PostgreSQL database dump
--

\restrict Gt4TJTm33rWctJQVwEEzZCf8Ph2df37tE8J2SdISG8oZB0iSk5yHjwRZTbCrocI

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    category character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentMethod" character varying(255),
    note character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO pos_admin;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: pos_admin
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO pos_admin;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pos_admin
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.members (
    id character varying(10) NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(10) NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.members OWNER TO pos_admin;

--
-- Name: products; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.products (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    barcode character varying(255) NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    category character varying(255),
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.products OWNER TO pos_admin;

--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.purchase_items (
    id integer NOT NULL,
    "purchaseOrderId" character varying(255) NOT NULL,
    "productId" character varying(255) NOT NULL,
    "productName" character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO pos_admin;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: pos_admin
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_items_id_seq OWNER TO pos_admin;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pos_admin
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.purchase_orders (
    id character varying(255) NOT NULL,
    "supplierName" character varying(255) NOT NULL,
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "paymentMethod" character varying(255),
    note character varying(255),
    "receivedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO pos_admin;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    "saleId" character varying(255) NOT NULL,
    "productId" character varying(255) NOT NULL,
    "productName" character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    "totalCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.sale_items OWNER TO pos_admin;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: pos_admin
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO pos_admin;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pos_admin
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.sales (
    id character varying(255) NOT NULL,
    "memberId" character varying(255),
    "totalAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "paymentMethod" character varying(255) NOT NULL,
    "receivedAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "changeAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "earnedPoints" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "discountAmount" numeric(10,2) DEFAULT 0 NOT NULL,
    "netTotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "usedPoints" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.sales OWNER TO pos_admin;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: pos_admin
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    "productId" character varying(255) NOT NULL,
    "movementType" character varying(255) NOT NULL,
    reason character varying(255) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "referenceId" character varying(255),
    note character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO pos_admin;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: pos_admin
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO pos_admin;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pos_admin
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.expenses (id, category, description, amount, "paymentMethod", note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.members (id, name, phone, points, "createdAt", "updatedAt") FROM stdin;
M001	วิลาสินี จันทนะโสตถิ์	0612709826	20	2026-09-01 18:55:36.533+00	2026-09-01 20:26:09.607+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.products (id, name, barcode, price, stock, category, status, "createdAt", "updatedAt", cost) FROM stdin;
P004	มันฝรั่งทอด 50g	885000000004	20.00	34	ขนม	active	2026-09-01 19:20:56.627+00	2026-09-01 19:23:56.102+00	0.00
P001	น้ำดื่ม	885000000001	10.00	89	เครื่องดื่ม	active	2026-09-01 18:34:04.978+00	2026-09-01 19:23:56.112+00	0.00
P008	ช็อกโกแลตนม 45g	885000000009	30.00	17	ขนม	active	2026-09-01 19:21:48.901+00	2026-09-01 20:26:09.593+00	0.00
P005	ขนมปังไส้ครีม	885000000006	12.00	25	อาหาร	active	2026-09-01 19:21:19.132+00	2026-09-02 05:38:21.491+00	0.00
P002	โค้ก 325ml	885000000002	15.00	44	เครื่องดื่ม	active	2026-09-01 18:59:32.605+00	2026-09-02 05:38:21.494+00	0.00
P003	นมสด 250ml	885000000003	13.00	38	เครื่องดื่ม	active	2026-09-01 19:20:49.625+00	2026-09-02 05:38:21.496+00	0.00
P010	สบู่ก้อน 100g	885000000011	35.00	6	ของใช้	active	2026-09-01 19:22:09.081+00	2026-09-02 05:49:38.195+00	0.00
P009	กระดาษทิชชู่ 6 ม้วน	885000000010	59.00	11	ของใช้	active	2026-09-01 19:21:57.913+00	2026-09-02 05:49:38.199+00	0.00
P006	กาแฟกระป๋อง 180ml	885000000007	18.00	39	เครื่องดื่ม	active	2026-09-01 19:21:29.5+00	2026-09-02 05:49:38.201+00	0.00
P007	น้ำส้ม 100%	885000000008	25.00	19	เครื่องดื่ม	active	2026-09-01 19:21:40.67+00	2026-09-02 05:49:38.202+00	0.00
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.purchase_items (id, "purchaseOrderId", "productId", "productName", quantity, cost, subtotal, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.purchase_orders (id, "supplierName", "totalAmount", status, "paymentMethod", note, "receivedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.sale_items (id, "saleId", "productId", "productName", quantity, price, cost, subtotal, "totalCost", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.sales (id, "memberId", "totalAmount", "paymentMethod", "receivedAmount", "changeAmount", "earnedPoints", "createdAt", "updatedAt", "discountAmount", "netTotal", "usedPoints") FROM stdin;
S00001	M001	20.00	cash	100.00	80.00	0	2026-09-01 18:57:05.46+00	2026-09-01 18:57:05.46+00	0.00	0.00	0
S00002	M001	65.00	cash	300.00	235.00	0	2026-09-01 19:12:23.64+00	2026-09-01 19:12:23.64+00	0.00	0.00	0
S00003	M001	60.00	cash	500.00	440.00	0	2026-09-01 19:12:48.175+00	2026-09-01 19:12:48.175+00	0.00	0.00	0
S00004	M001	327.00	cash	1000.00	673.00	30	2026-09-01 19:23:56.085+00	2026-09-01 19:23:56.085+00	0.00	0.00	0
S00005	M001	179.00	cash	200.00	51.00	10	2026-09-01 19:30:00.819+00	2026-09-01 19:30:00.819+00	0.00	0.00	0
S00006	M001	194.00	cash	900.00	706.00	10	2026-09-01 20:26:09.57+00	2026-09-01 20:26:09.57+00	0.00	0.00	0
S00007	\N	60.00	qr	60.00	0.00	0	2026-09-02 05:38:13.919+00	2026-09-02 05:38:13.919+00	0.00	0.00	0
S00008	\N	58.00	qr	58.00	0.00	0	2026-09-02 05:38:21.489+00	2026-09-02 05:38:21.489+00	0.00	0.00	0
S00009	\N	137.00	card	137.00	0.00	0	2026-09-02 05:49:38.189+00	2026-09-02 05:49:38.189+00	0.00	0.00	0
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: pos_admin
--

COPY public.stock_movements (id, "productId", "movementType", reason, quantity, "referenceId", note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pos_admin
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pos_admin
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 1, false);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pos_admin
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pos_admin
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: members members_phone_key; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key UNIQUE (phone);


--
-- Name: members members_phone_key1; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key1 UNIQUE (phone);


--
-- Name: members members_phone_key2; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key2 UNIQUE (phone);


--
-- Name: members members_phone_key3; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key3 UNIQUE (phone);


--
-- Name: members members_phone_key4; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key4 UNIQUE (phone);


--
-- Name: members members_phone_key5; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key5 UNIQUE (phone);


--
-- Name: members members_phone_key6; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_phone_key6 UNIQUE (phone);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- Name: products products_barcode_key1; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key1 UNIQUE (barcode);


--
-- Name: products products_barcode_key2; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key2 UNIQUE (barcode);


--
-- Name: products products_barcode_key3; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key3 UNIQUE (barcode);


--
-- Name: products products_barcode_key4; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key4 UNIQUE (barcode);


--
-- Name: products products_barcode_key5; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key5 UNIQUE (barcode);


--
-- Name: products products_barcode_key6; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key6 UNIQUE (barcode);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: pos_admin
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict Gt4TJTm33rWctJQVwEEzZCf8Ph2df37tE8J2SdISG8oZB0iSk5yHjwRZTbCrocI

