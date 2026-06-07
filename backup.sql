--
-- PostgreSQL database dump
--

\restrict f6afICGmVVItTHcdbw7sx1B9ykYGEH8oB548Q06hTKQJik4yF8wxyRdMvz1EVV5

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

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
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO video_ratings;

--
-- Name: custom_field_definitions; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.custom_field_definitions (
    id integer NOT NULL,
    name character varying NOT NULL,
    field_type character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    entity_type character varying DEFAULT 'work'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.custom_field_definitions OWNER TO video_ratings;

--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.custom_field_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_field_definitions_id_seq OWNER TO video_ratings;

--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.custom_field_definitions_id_seq OWNED BY public.custom_field_definitions.id;


--
-- Name: performer_tags; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.performer_tags (
    performer_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.performer_tags OWNER TO video_ratings;

--
-- Name: performers; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.performers (
    id integer NOT NULL,
    name character varying NOT NULL,
    furigana character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_fields jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.performers OWNER TO video_ratings;

--
-- Name: performers_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.performers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performers_id_seq OWNER TO video_ratings;

--
-- Name: performers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.performers_id_seq OWNED BY public.performers.id;


--
-- Name: tag_categories; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.tag_categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    entity_type character varying NOT NULL,
    is_multi_select boolean DEFAULT true NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.tag_categories OWNER TO video_ratings;

--
-- Name: tag_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.tag_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tag_categories_id_seq OWNER TO video_ratings;

--
-- Name: tag_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.tag_categories_id_seq OWNED BY public.tag_categories.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying NOT NULL,
    score integer,
    description text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.tags OWNER TO video_ratings;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO video_ratings;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: work_files; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.work_files (
    id integer NOT NULL,
    work_id integer NOT NULL,
    path character varying NOT NULL,
    display_name character varying,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.work_files OWNER TO video_ratings;

--
-- Name: work_files_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.work_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_files_id_seq OWNER TO video_ratings;

--
-- Name: work_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.work_files_id_seq OWNED BY public.work_files.id;


--
-- Name: work_performers; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.work_performers (
    work_id integer NOT NULL,
    performer_id integer NOT NULL,
    is_main boolean DEFAULT false NOT NULL
);


ALTER TABLE public.work_performers OWNER TO video_ratings;

--
-- Name: work_tags; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.work_tags (
    work_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.work_tags OWNER TO video_ratings;

--
-- Name: works; Type: TABLE; Schema: public; Owner: video_ratings
--

CREATE TABLE public.works (
    id integer NOT NULL,
    title character varying NOT NULL,
    maker character varying,
    series character varying,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.works OWNER TO video_ratings;

--
-- Name: works_id_seq; Type: SEQUENCE; Schema: public; Owner: video_ratings
--

CREATE SEQUENCE public.works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.works_id_seq OWNER TO video_ratings;

--
-- Name: works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: video_ratings
--

ALTER SEQUENCE public.works_id_seq OWNED BY public.works.id;


--
-- Name: custom_field_definitions id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.custom_field_definitions ALTER COLUMN id SET DEFAULT nextval('public.custom_field_definitions_id_seq'::regclass);


--
-- Name: performers id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.performers ALTER COLUMN id SET DEFAULT nextval('public.performers_id_seq'::regclass);


--
-- Name: tag_categories id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.tag_categories ALTER COLUMN id SET DEFAULT nextval('public.tag_categories_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: work_files id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_files ALTER COLUMN id SET DEFAULT nextval('public.work_files_id_seq'::regclass);


--
-- Name: works id; Type: DEFAULT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.works ALTER COLUMN id SET DEFAULT nextval('public.works_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.alembic_version (version_num) FROM stdin;
005
\.


--
-- Data for Name: custom_field_definitions; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.custom_field_definitions (id, name, field_type, created_at, entity_type, sort_order) FROM stdin;
3	DL不完全	boolean	2026-06-05 13:13:01.881136	work	0
1	生年月日	date	2026-06-05 12:29:22.650414	performer	1
8	品番	text	2026-06-06 12:33:37.581885	work	3
10	発売日	date	2026-06-06 15:17:01.647891	work	4
12	撮影時年齢	number	2026-06-06 16:50:10.510223	work	5
\.


--
-- Data for Name: performer_tags; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.performer_tags (performer_id, tag_id) FROM stdin;
1	7
1	12
1	14
76	1
76	12
76	8
76	14
17	2
17	13
17	15
17	9
54	7
54	3
54	12
54	15
66	4
66	7
66	13
1	1
66	17
42	1
42	8
42	13
42	15
33	3
33	11
33	15
33	9
13	1
13	10
13	15
13	11
64	4
64	6
64	13
64	17
74	3
74	9
74	13
74	16
45	9
45	2
45	12
45	15
39	3
39	9
39	15
39	12
29	3
29	8
16	12
29	12
16	3
16	15
29	15
16	8
55	3
55	8
55	13
55	16
\.


--
-- Data for Name: performers; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.performers (id, name, furigana, created_at, updated_at, custom_fields) FROM stdin;
31	結城夏那	ゆうきかな	2026-06-05 12:28:55.516434	2026-06-06 07:57:47.804309	{"生年月日": "1993-11-29"}
34	西野花恋	にしのかれん	2026-06-05 12:28:55.516434	2026-06-06 08:00:03.930454	{"生年月日": "1998-07-22"}
37	新原里彩	にいはらりさ	2026-06-05 12:28:55.516434	2026-06-06 08:00:55.01027	{"生年月日": "1998-06-11"}
47	三花愛良	みはなあいら	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{"生年月日": "1994-05-30"}
48	水波メイカ	みなみめいか	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{"生年月日": "1998-01-25"}
54	神崎美優	かんざきみゆう	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{"生年月日": "1994-01-20"}
70	星野美憂	ほしのみゆう	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
73	詩宮妃乃	しのみやひの	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{"生年月日": "2000-02-12"}
74	夏風ひかり	なつかぜひかり	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{"生年月日": "2000-06-25"}
66	赤坂沙絵	あかさかさえ	2026-06-05 12:28:55.516434	2026-06-06 08:34:48.857707	{"生年月日": "1999-01-22"}
4	荒井暖菜	あらいはるな	2026-06-05 12:28:55.516434	2026-06-06 08:35:13.054232	{"生年月日": "2002-02-15"}
64	有岡ゆい	ありおかゆい	2026-06-05 12:28:55.516434	2026-06-06 08:36:02.621827	{"生年月日": "1992-11-12"}
3	安藤穂乃果	あんどうほのか	2026-06-05 12:28:55.516434	2026-06-06 08:37:11.151961	{"生年月日": "1999-06-02"}
6	飯沼朱李	いいぬまあかり	2026-06-05 12:28:55.516434	2026-06-06 08:37:50.606692	{"生年月日": "1997-10-29"}
7	井坂里緒菜	いさかれおな	2026-06-05 12:28:55.516434	2026-06-06 08:38:11.809222	{"生年月日": "2002-10-20"}
69	岡詩乃	おかうたの	2026-06-05 12:28:55.516434	2026-06-06 09:11:22.684531	{"生年月日": "2001-01-25"}
21	緒方瞳	おがたひとみ	2026-06-05 12:28:55.516434	2026-06-06 09:37:04.297616	{"生年月日": "1998-04-02"}
51	笠井恵利香	かさいえりか	2026-06-05 12:28:55.516434	2026-06-06 09:38:31.582988	{"生年月日": "1996-06-25"}
52	金子美穂	かねこみほ	2026-06-05 12:28:55.516434	2026-06-06 09:38:56.328322	{"生年月日": "1996-10-13"}
8	神条れいか	かみじょうれいか	2026-06-05 12:28:55.516434	2026-06-06 09:39:20.248273	{"生年月日": "2001-02-03"}
9	河合真由	かわいまゆ	2026-06-05 12:28:55.516434	2026-06-06 09:40:18.80395	{"生年月日": "1998-10-17"}
10	川野りあ	かわのりあ	2026-06-05 12:28:55.516434	2026-06-06 09:40:41.069391	{"生年月日": "2009-06-10"}
58	来生かほ	きずきかほ	2026-06-05 12:28:55.516434	2026-06-06 09:41:03.067028	{"生年月日": "2001-06-28"}
71	黒宮あや	くろみやあや	2026-06-05 12:28:55.516434	2026-06-06 09:41:46.229036	{"生年月日": "1998-11-28"}
13	黒宮れい	くろみやれい	2026-06-05 12:28:55.516434	2026-06-06 09:42:03.59014	{"生年月日": "2000-11-29"}
5	後藤聖良	ごとうせいら	2026-06-05 12:28:55.516434	2026-06-06 09:42:33.262943	{"生年月日": "1998-06-08"}
40	小林架純	こばやしかすみ	2026-06-05 12:28:55.516434	2026-06-06 09:43:04.793811	{"生年月日": "2000-05-06"}
12	近藤あさみ	こんどうあさみ	2026-06-05 12:28:55.516434	2026-06-06 09:43:33.783413	{"生年月日": "2000-02-04"}
36	小林桃華	こばやしももか	2026-06-05 12:28:55.516434	2026-06-06 09:43:55.643148	{"生年月日": "2001-08-25"}
23	桜あいり	さくらあいり	2026-06-05 12:28:55.516434	2026-06-06 09:44:50.397605	{"生年月日": "1998-06-01"}
24	佐々木みゆう	ささきみゆう	2026-06-05 12:28:55.516434	2026-06-06 09:45:17.206525	{"生年月日": "1998-10-07"}
25	しほの涼	しほのりょう	2026-06-05 12:28:55.516434	2026-06-06 09:48:04.752814	{"生年月日": "1991-09-07"}
79	清水ちか	しみずちか	2026-06-05 12:28:55.516434	2026-06-06 09:48:31.282956	{"生年月日": "1999-07-13"}
26	清水美蘭	しみずみらん	2026-06-05 12:28:55.516434	2026-06-06 09:48:54.695559	{"生年月日": "2000-05-20"}
63	涼川夏飛	すずかわかひ	2026-06-05 12:28:55.516434	2026-06-06 09:49:49.825927	{"生年月日": "1992-08-19"}
50	芹沢南	せりざわみなみ	2026-06-05 12:28:55.516434	2026-06-06 09:50:16.963322	{"生年月日": "1996-07-16"}
55	中井ゆかり	なかいゆかり	2026-06-05 12:28:55.516434	2026-06-06 12:02:35.701254	{"生年月日": "1992-07-07"}
60	中村早希	なかむらさき	2026-06-05 12:28:55.516434	2026-06-06 12:10:37.447897	{"生年月日": "2001-09-07"}
20	西野小春	にしのこはる	2026-06-05 12:28:55.516434	2026-06-06 12:16:04.76599	{"生年月日": "1996-08-24"}
42	西野華	にしのはな	2026-06-05 12:28:55.516434	2026-06-06 12:19:14.206454	{"生年月日": "1997-06-28"}
41	花沢あい	はなざわあい	2026-06-05 12:28:55.516434	2026-06-06 12:20:39.764056	{"生年月日": "1999-12-22"}
77	日美野梓	ひびのあずさ	2026-06-05 12:28:55.516434	2026-06-06 12:21:03.069859	{"生年月日": "1990-07-26"}
56	藤松みく	ふじまつみく	2026-06-05 12:28:55.516434	2026-06-06 12:22:23.435269	{"生年月日": "1994-04-04"}
43	星野希	ほしののぞみ	2026-06-05 12:28:55.516434	2026-06-06 12:25:57.958978	{"生年月日": "1999-11-05"}
14	牧原あゆ	まきはらあゆ	2026-06-05 12:28:55.516434	2026-06-06 12:28:38.814506	{"生年月日": "1998-12-11"}
38	真野しずく	まのしずく	2026-06-05 12:28:55.516434	2026-06-06 12:29:07.532901	{"生年月日": "1996-11-13"}
59	南蓮菜	みなみれんな	2026-06-05 12:28:55.516434	2026-06-06 12:30:02.468435	{"生年月日": "1998-10-16"}
15	源結菜	みなもとゆいな	2026-06-05 12:28:55.516434	2026-06-06 12:30:37.094264	{"生年月日": "2000-08-16"}
18	森下真依	もりしたまい	2026-06-05 12:28:55.516434	2026-06-06 12:31:27.577604	{"生年月日": "1997-06-30"}
28	山田レイナ	やまだれいな	2026-06-05 12:28:55.516434	2026-06-06 12:32:35.608989	{"生年月日": "1998-01-19"}
30	山中知恵	やまなかともえ	2026-06-05 12:28:55.516434	2026-06-06 12:32:55.978552	{"生年月日": "1995-01-16"}
1	こもも	こもも	2026-06-05 12:28:55.516434	2026-06-05 13:00:25.294718	{}
76	ひな	ひな	2026-06-05 12:28:55.516434	2026-06-05 13:28:32.349434	{}
17	みずのそら	みずのそら	2026-06-05 12:28:55.516434	2026-06-05 13:41:57.032432	{}
2	もえな	もえな	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
19	新倉ひまり	にいくらひまり	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
29	山田りかこ	やまだりかこ	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
32	田中美鈴	たなかみすず	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
35	中山ユリ	なかやまゆり	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
44	猫みみ	ねこみみ	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
45	長島きらら	ながしまきらら	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
62	藤村みゆ	ふじむらみゆ	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
72	まりあ	まりあ	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
75	ティアラ	てぃあら	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
78	さくら	さくら	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
80	ローラB	ろーらびー	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434	{}
33	泉明日香	いずみあすか	2026-06-05 12:28:55.516434	2026-06-06 09:10:54.561424	{"生年月日": "1992-09-20"}
22	小沢岬	おざわみさき	2026-06-05 12:28:55.516434	2026-06-06 09:38:07.894652	{"生年月日": "1999-08-26"}
49	河合すみれ	かわいすみれ	2026-06-05 12:28:55.516434	2026-06-06 09:40:02.328533	{"生年月日": "2001-09-06"}
11	北村真珠	きたむらまみ	2026-06-05 12:28:55.516434	2026-06-06 09:41:30.160736	{"生年月日": "1998-08-22"}
57	五城せのん	ごじょうせのん	2026-06-05 12:28:55.516434	2026-06-06 09:42:17.943734	{"生年月日": "2000-09-05"}
67	早乙女萌	さおとめもえ	2026-06-05 12:28:55.516434	2026-06-06 09:44:27.906264	{"生年月日": "1994-11-15"}
53	椎名もも	しいなもも	2026-06-05 12:28:55.516434	2026-06-06 09:45:34.253072	{"生年月日": "1997-08-06"}
27	末永みゆ	すえながみゆ	2026-06-05 12:28:55.516434	2026-06-06 09:49:12.384451	{"生年月日": "1995-11-04"}
68	中沢ひめか	なかざわひめか	2026-06-05 12:28:55.516434	2026-06-06 12:02:57.071403	{"生年月日": "1998-05-30"}
39	久川美佳	ひさかわみか	2026-06-05 12:28:55.516434	2026-06-06 12:19:57.038208	{"生年月日": "2002-01-28"}
65	藤宮えりか	ふじみやえりか	2026-06-05 12:28:55.516434	2026-06-06 12:23:00.229585	{"生年月日": "1989-06-04"}
46	三浦璃那	みうらりいな	2026-06-05 12:28:55.516434	2026-06-06 12:29:33.321527	{"生年月日": "2000-03-25"}
16	宮田飛鳥	みやたあすか	2026-06-05 12:28:55.516434	2026-06-06 12:30:59.307465	{"生年月日": "1998-10-15"}
61	青井こはる	あおいこはる	2026-06-05 12:28:55.516434	2026-06-06 16:39:40.299638	{"生年月日": "1999-02-06"}
\.


--
-- Data for Name: tag_categories; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.tag_categories (id, name, entity_type, is_multi_select, description, sort_order) FROM stdin;
2	年齢感	performer	f	実年齢etcというより、「何歳くらいに見えそうか?」	0
1	顔	performer	f	一般的に可愛いか美人かどうか	1
3	体型	performer	f	\N	2
4	おっぱい	performer	f	\N	3
5	ビキニ	work	t	\N	0
6	品質	work	f	\N	1
7	エロ演出	work	t	\N	2
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.tags (id, category_id, name, score, description, sort_order) FROM stdin;
1	2	JS	1	JS	0
2	2	JS〜JC	2	\N	1
3	2	JC	1	\N	2
4	2	JC〜JK	2	\N	3
5	2	JK	0	\N	4
6	1	ブス	0	\N	0
7	1	ちょいブス	1	\N	1
8	1	ふつう	2	\N	2
9	1	かわいい	3	\N	3
10	1	ちょーかわいい	4	\N	4
11	3	スレンダー	\N	\N	0
12	3	ふつう	\N	\N	1
13	3	むちむち	\N	\N	2
14	4	ない	\N	\N	0
15	4	貧乳	\N	\N	1
16	4	ふつう	\N	\N	2
17	4	巨乳	\N	\N	3
18	5	小さめ	2	\N	0
19	5	マイクロ	3	\N	1
20	5	眼帯	2	\N	2
21	5	Tバック	2	\N	3
22	5	ふつう	1	\N	4
23	5	なし	0	\N	5
24	6	ひどい	0	\N	0
25	6	ふつう	1	\N	1
26	6	高品質	2	\N	2
27	5	チューブトップ	2	\N	6
28	7	パンチラ	1	\N	0
29	7	透け感	2	\N	1
30	7	ハプニング	3	\N	2
31	7	生尻	2	\N	3
33	7	食い込み	2	\N	5
34	7	下乳	2	\N	6
35	7	疑似フェラ	1	\N	7
36	7	乳揺れ	1	\N	8
37	7	ツイスター	1	\N	9
38	7	百合	1	\N	10
\.


--
-- Data for Name: work_files; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.work_files (id, work_id, path, display_name, "order") FROM stdin;
1	139	smb://synology-nas/home/Videos/p/jiv/akasaka_sae/赤坂沙絵/沙絵motion/SCDV-24011/SCDV-24011.m4v	test	0
3	1	smb://synology-nas/home/Videos/p/jiv/komomo/こもも/コモモ モモミルク/zzzz 022  1920  9000/zzzz 022  1920  9000.mkv	video	0
4	101	smb://synology-nas/home/Videos/p/jiv/nishino_hana/西野華/Flower Garden/icdv-30009.mkv	video	0
5	82	smb://synology-nas/home/Videos/p/jiv/izumi_asuka/泉明日香/明日香のTないと/izumi-asuka_asuka-no-t-naito/[IV] Izumi Asuka - Asuka no T Naito [2007.04.27] [SCDV-22008] [82m11s H.264].avi	本編	0
6	25	smb://synology-nas/home/Videos/p/jiv/kuromiya_rei/黒宮れい/天真爛漫/[IMBD-120] Rei Kuromiya/[IMBD-120] Rei Kuromiya 1080p.mp4	本編	0
7	25	smb://synology-nas/home/Videos/p/jiv/kuromiya_rei/黒宮れい/天真爛漫/[IMBD-120] Rei Kuromiya/[IMBD-120] Rei Kuromiya 1080p Bonus.mp4	ボーナス	0
8	136	smb://synology-nas/home/Videos/p/jiv/arioka_yui/有岡ゆい/Cuteな彼女/SCDV-24006/SCDV-24006.m4v	本編	0
9	149	smb://synology-nas/home/Videos/p/jiv/natsukaze_hikari/夏風ひかり/ひかりのガールフレンド/ICDV-30234.mp4	本編	0
10	106	smb://synology-nas/home/Videos/p/jiv/nagashima_kirara/長島きらら/Cutie Smile きらきらきらら/長島きらCutie Smile きらきらきらら Blu-ray/ZEUSTB-004.mp4	本編	0
11	93	smb://synology-nas/home/Videos/p/jiv/hisakawa_mika/久川美佳/天真爛漫/[IMBD-316] Mika Hisakawa/[IMBD-316] Mika Hisakawa 720p.mp4	本編	0
12	93	smb://synology-nas/home/Videos/p/jiv/hisakawa_mika/久川美佳/天真爛漫/[IMBD-316] Mika Hisakawa/[IMBD-316] Mika Hisakawa 720p Bonus.mp4	ボーナス	0
13	39	smb://synology-nas/home/Videos/p/jiv/miyata_asuka/宮田飛鳥/ゆりゆり/ICDV-30089/ICDV-30089  Rikako Yamada & Asuka Miyata - Yuri Yuri.mp4	本編	0
14	120	smb://synology-nas/home/Videos/p/jiv/nakai_yukari/中井ゆかり/Cuteな彼女/SCDV-24004/SCDV-24004.m4v	本編	0
\.


--
-- Data for Name: work_performers; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.work_performers (work_id, performer_id, is_main) FROM stdin;
1	1	t
2	2	t
3	3	t
5	4	t
6	4	t
7	4	t
8	4	t
9	4	t
10	5	t
11	6	t
12	7	t
13	8	t
14	9	t
15	9	t
16	9	t
17	9	t
18	9	t
19	10	t
20	11	t
21	12	t
22	13	t
23	13	t
24	13	t
25	13	t
26	14	t
27	14	t
28	14	t
29	14	t
30	14	t
31	14	t
32	14	t
33	15	t
34	15	t
35	15	t
36	16	t
37	16	t
38	16	t
39	16	t
40	17	t
41	17	t
42	17	t
43	17	t
44	17	t
45	17	t
46	17	t
47	17	t
48	18	t
49	18	t
50	19	t
51	19	t
52	19	t
53	19	t
54	19	t
55	20	t
56	21	t
57	22	t
58	23	t
59	23	t
60	24	t
61	24	t
62	24	t
63	24	t
64	25	t
65	26	t
66	26	t
67	26	t
68	27	t
69	28	t
70	28	t
71	29	t
72	29	t
73	30	t
74	30	t
75	31	t
76	31	t
77	32	t
78	32	t
79	32	t
80	32	t
81	33	t
82	33	t
83	34	t
84	35	t
85	36	t
86	36	t
87	37	t
88	38	t
89	38	t
90	39	t
91	39	t
92	39	t
93	39	t
94	39	t
95	40	t
96	40	t
97	40	t
98	41	t
99	41	t
100	42	t
101	42	t
102	43	t
103	43	t
104	44	t
105	45	t
106	45	t
107	45	t
108	45	t
109	46	t
110	47	t
111	48	t
112	49	t
113	49	t
114	50	t
115	51	t
116	52	t
117	53	t
118	53	t
119	54	t
120	55	t
121	56	t
122	57	t
123	57	t
124	57	t
125	58	t
126	58	t
127	59	t
128	60	t
129	60	t
130	60	t
131	60	t
132	60	t
133	61	t
134	62	t
135	63	t
136	64	t
137	64	t
138	65	t
139	66	t
140	67	t
141	68	t
142	69	t
143	70	t
144	71	t
145	71	t
146	72	t
147	72	t
148	73	t
149	74	t
150	75	t
151	76	t
152	77	t
153	78	t
154	79	t
155	80	t
39	29	f
\.


--
-- Data for Name: work_tags; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.work_tags (work_id, tag_id) FROM stdin;
1	21
1	22
151	22
1	24
151	24
40	18
1	28
40	33
40	27
40	25
40	35
40	28
40	29
40	31
45	18
45	25
45	31
45	34
45	27
45	35
45	33
119	18
119	27
119	25
119	21
119	33
119	34
139	34
139	19
139	21
139	25
139	28
101	18
101	21
101	25
82	21
82	25
82	28
82	18
25	22
25	26
25	27
136	34
136	31
136	21
136	28
136	18
136	25
149	28
149	18
149	20
149	27
149	34
149	35
149	31
106	23
106	25
93	22
93	26
39	18
39	25
39	38
39	37
120	31
120	21
120	18
120	25
120	35
120	28
120	33
120	34
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: video_ratings
--

COPY public.works (id, title, maker, series, custom_fields, created_at, updated_at) FROM stdin;
2	もえもえはっぴ〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
3	ミスアテナ 2012 VOL.3	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
5	夏の日の少女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
6	天真爛漫	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
7	純情ロマンチカ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
8	僕の太陽	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
9	暖菜の課外授業 ～Vol.38～	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
10	しまコレ 〜しましまコレクション 後藤聖良	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
11	ピンクマーメイド	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
12	りおな新体操	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
13	ピュアローズ Vol.06	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
14	ニーハイコレクション 〜絶対領域〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
15	純真無垢 〜ホワイトレーベル〜 河合真由 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
16	転校生	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
17	夏少女 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
18	天真爛漫 Part3	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
19	川野りあ Part4	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
20	いただきまったりん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
21	VISITOR	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
22	しまコレ しましまコレクション	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
23	純心無垢 特別編 〜アニま〜る〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
24	いもうと目線 れいとふたりっきり Part4	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
26	純真無垢 〜ホワイトレーベル〜 メイキング編	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
27	独占!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
28	ふたり	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
29	ニーハイコレクション 〜絶対領域〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
30	ニーハイコレクション 〜絶対領域〜 牧原あゆ Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
31	純真無垢 〜ホワイトレーベル〜 Part13	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
32	あゆ日和 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
33	ニーハイコレクション 〜絶対領域〜 源結菜 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
34	ふたり。	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
35	夏少女 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
36	ないしょのあすか	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
37	あすか&ロマンス	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
38	あすかMagic	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
41	そらちゃん、かわいすぎ!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
42	そらを見たかい	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
43	そらと飛べるはず	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
44	君の名はそら	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
45	そらそらスキップ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
46	みずのそら Premium Blu-ray BOX	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
47	P-sky	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
48	まいウェイ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
49	月と太陽	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
50	ひまり・マリ・マリ!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
51	片思いHimary	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
52	Thousands God!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
53	ランドセルが邪魔をする	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
54	ひまりからWonderland	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
55	しまコレ 〜しましまコレクション〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
56	ニーハイコレクション 〜絶対領域〜 緒方瞳 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
57	ページワン	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
58	ニーハイコレクション 〜絶対領域〜 桜あいり Part3	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
59	ニーハイコレクション 〜絶対領域〜 桜あいり Part4	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
60	kawaii	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
61	純心美少女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
62	みゆうの課外授業 〜Vol.3〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
63	メルト	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
64	スクール水着Annual	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
65	ランランみらん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
66	ススメ! みらん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
67	少女のプリズム	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
68	ぜ〜んぶ競泳水着だよっ!!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
69	十人十色	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
70	美少女学園 Vol.60 10 後編 山田レイナ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
71	上からりかこ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
72	山田りかこと、おうちデータ vol.1	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
73	花鳥風月 〜Neoホワイトレーベル〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
74	花鳥風月	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
75	現役女子高生グラビア	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
76	美少女学園 Vol.62	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
77	もももも Vol.37	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
78	ぷりぷりたまご vol.30 みすずちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
79	もももも vol.58 みすずちゃん 後編	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
80	もももも Vol.51	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
81	明日香のTないと~	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
83	純真無垢 〜ホワイトレーベル〜 西野花恋 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
84	ユリ10歳	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
85	なちゅもも とっておきの未公開秘蔵映像	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
86	キラももChan	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
87	ピュア・スマイル	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
88	ひかりのしずく	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
89	Sugar Drop	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
90	初写	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
91	初めてのChu	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
92	夏少女 Part2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
94	ふたり。	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
95	Cutie Berry 15歳	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
40	ドレミファそら	\N	\N	{"品番": "ICDV-30090", "発売日": "2012-07-12"}	2026-06-05 12:28:55.516434	2026-06-06 15:29:59.458603
93	天真爛漫	\N	\N	{"品番": "IMBD-316", "発売日": "2015-02-25", "撮影時年齢": "13"}	2026-06-05 12:28:55.516434	2026-06-06 17:37:20.151634
96	かすみこれくしょん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
97	美少女サプリ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
98	渋谷区立原宿ファッション女学院 番外編 ソロイメージ 花沢あい 2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
99	あい LOVE YOU	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
100	Flower Garden	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
102	のぞみのリクエスト	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
103	のぞみどーり!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
104	ぷにぷに あきはばらさいきょうJSびしょうじょ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
105	きらきらLAND	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
107	きらきらレボリューション	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
108	いわゆるひとつのきらら	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
109	制服ニーハイ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
110	ピース学院 中等部物語 学校編 第1巻	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
111	エンジェルキュホワイトシリーズ VOL.6 水波メイカ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
112	すみれの花が咲く頃に	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
113	すみれの花物語	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
114	高校1年生@クレープ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
115	えりか100%	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
116	たっぷり Part2 金子美穂 11歳	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
117	たっぷり Part2 椎名もも	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
118	たっぷり 椎名もも	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
119	FRUITY HIP	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
121	Cuteな彼女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
122	ずーっと見てニャン	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
123	透明美少女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
124	ラブリースマイル	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
125	純粋少女JC 〜中 学 生 14才のいもうと〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
126	じゅーしぃーJC 〜まっしろな14才のキミに〜	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
127	レンナレンナレンナ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
128	ノッてる! さきちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
129	ビューティーさき	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
130	Dance with さきちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
131	走れ! さきちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
132	先取り! さきちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
133	クラスのセンター!!!	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
134	Cuteな彼女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
135	Cuteな彼女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
137	Cuteな彼女 2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
138	Cuteな彼女	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
140	萌のレシピ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
141	クラスメイト	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
142	はじめましての詩	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
143	あるばむ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
144	たっぷり あや Part 8	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
145	ニーハイコレクション 〜絶対領域〜 黒宮あや Part 2	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
146	たっぷり スペシャル レオタード編 まりあ	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
147	Innocence	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
148	たっぷり 詩宮妃乃	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
150	チルチル Vol.38 ティアラちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
151	チルチル Vol.44 ひなちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
152	Noah 16	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
153	ちるちる No.11 さくらちゃん	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
154	クラスのセンター!!! 清水ちか 4	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
155	キャンディドールコレクション	\N	\N	{}	2026-06-05 12:28:55.516434	2026-06-05 12:28:55.516434
136	Cuteな彼女	\N	\N	{"品番": "SCDV-24006", "発売日": "2007-07-13", "撮影時年齢": "14"}	2026-06-05 12:28:55.516434	2026-06-06 17:15:21.364294
1	コモモ モモミルク	\N	\N	{"発売日": "2012-09-21", "DL不完全": false}	2026-06-05 12:28:55.516434	2026-06-06 15:26:02.445763
139	沙絵motion	\N	\N	{"品番": "SCDV-24011", "発売日": "2007-11-30"}	2026-06-05 12:28:55.516434	2026-06-06 16:08:57.65385
101	Flower Party	\N	\N	{"品番": "ICDV-30009", "発売日": "2008-05-02", "撮影時年齢": "10"}	2026-06-05 12:28:55.516434	2026-06-06 16:50:30.55155
82	明日香のTないと	\N	\N	{"品番": "SCDV-22008", "発売日": "2007-04-27", "撮影時年齢": "14"}	2026-06-05 12:28:55.516434	2026-06-06 16:56:31.972488
25	天真爛漫	\N	\N	{"品番": "IMBD-120", "発売日": "2012-10-25", "撮影時年齢": "11"}	2026-06-05 12:28:55.516434	2026-06-06 17:05:00.651874
149	ひかりのガールフレンド	\N	\N	{"品番": "ICDV-30234", "発売日": "2016-01-28", "撮影時年齢": "15"}	2026-06-05 12:28:55.516434	2026-06-06 17:21:42.287618
106	Cutie Smile きらきらきらら	\N	\N	{"品番": "ZEUSTB-004", "発売日": "2015-09-10"}	2026-06-05 12:28:55.516434	2026-06-06 17:31:53.684002
39	ゆりゆり	\N	\N	{"品番": "ICDV-30089", "発売日": "2012-07-01", "撮影時年齢": "13"}	2026-06-05 12:28:55.516434	2026-06-06 17:46:25.193002
120	Cuteな彼女	\N	\N	{"品番": "SCDV-24004", "発売日": "2007-06-15", "撮影時年齢": "14"}	2026-06-05 12:28:55.516434	2026-06-06 18:04:05.948437
\.


--
-- Name: custom_field_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.custom_field_definitions_id_seq', 12, true);


--
-- Name: performers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.performers_id_seq', 80, true);


--
-- Name: tag_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.tag_categories_id_seq', 8, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.tags_id_seq', 38, true);


--
-- Name: work_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.work_files_id_seq', 14, true);


--
-- Name: works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: video_ratings
--

SELECT pg_catalog.setval('public.works_id_seq', 155, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: custom_field_definitions custom_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT custom_field_definitions_pkey PRIMARY KEY (id);


--
-- Name: performer_tags performer_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.performer_tags
    ADD CONSTRAINT performer_tags_pkey PRIMARY KEY (performer_id, tag_id);


--
-- Name: performers performers_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.performers
    ADD CONSTRAINT performers_pkey PRIMARY KEY (id);


--
-- Name: tag_categories tag_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.tag_categories
    ADD CONSTRAINT tag_categories_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: custom_field_definitions uq_custom_field_definitions_entity_name; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.custom_field_definitions
    ADD CONSTRAINT uq_custom_field_definitions_entity_name UNIQUE (entity_type, name);


--
-- Name: work_files work_files_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_files
    ADD CONSTRAINT work_files_pkey PRIMARY KEY (id);


--
-- Name: work_performers work_performers_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_performers
    ADD CONSTRAINT work_performers_pkey PRIMARY KEY (work_id, performer_id);


--
-- Name: work_tags work_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT work_tags_pkey PRIMARY KEY (work_id, tag_id);


--
-- Name: works works_pkey; Type: CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_pkey PRIMARY KEY (id);


--
-- Name: ix_custom_field_definitions_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_custom_field_definitions_id ON public.custom_field_definitions USING btree (id);


--
-- Name: ix_performers_furigana; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_performers_furigana ON public.performers USING btree (furigana);


--
-- Name: ix_performers_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_performers_id ON public.performers USING btree (id);


--
-- Name: ix_performers_name; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_performers_name ON public.performers USING btree (name);


--
-- Name: ix_tag_categories_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_tag_categories_id ON public.tag_categories USING btree (id);


--
-- Name: ix_tags_category_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_tags_category_id ON public.tags USING btree (category_id);


--
-- Name: ix_tags_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_tags_id ON public.tags USING btree (id);


--
-- Name: ix_work_files_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_work_files_id ON public.work_files USING btree (id);


--
-- Name: ix_work_files_work_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_work_files_work_id ON public.work_files USING btree (work_id);


--
-- Name: ix_works_custom_fields; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_works_custom_fields ON public.works USING gin (custom_fields);


--
-- Name: ix_works_id; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_works_id ON public.works USING btree (id);


--
-- Name: ix_works_maker; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_works_maker ON public.works USING btree (maker);


--
-- Name: ix_works_series; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_works_series ON public.works USING btree (series);


--
-- Name: ix_works_title; Type: INDEX; Schema: public; Owner: video_ratings
--

CREATE INDEX ix_works_title ON public.works USING btree (title);


--
-- Name: performer_tags performer_tags_performer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.performer_tags
    ADD CONSTRAINT performer_tags_performer_id_fkey FOREIGN KEY (performer_id) REFERENCES public.performers(id) ON DELETE CASCADE;


--
-- Name: performer_tags performer_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.performer_tags
    ADD CONSTRAINT performer_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: tags tags_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.tag_categories(id) ON DELETE CASCADE;


--
-- Name: work_files work_files_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_files
    ADD CONSTRAINT work_files_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: work_performers work_performers_performer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_performers
    ADD CONSTRAINT work_performers_performer_id_fkey FOREIGN KEY (performer_id) REFERENCES public.performers(id) ON DELETE CASCADE;


--
-- Name: work_performers work_performers_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_performers
    ADD CONSTRAINT work_performers_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: work_tags work_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT work_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: work_tags work_tags_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: video_ratings
--

ALTER TABLE ONLY public.work_tags
    ADD CONSTRAINT work_tags_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict f6afICGmVVItTHcdbw7sx1B9ykYGEH8oB548Q06hTKQJik4yF8wxyRdMvz1EVV5

