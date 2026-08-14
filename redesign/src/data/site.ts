export const site = {
  name: "Paper Crane Wellness",
  tagline: "Things don't have to stay this way forever.",
  url: "https://papercranewellness.com",
  email: "rebekah@papercranewellness.com",
  phone: "(843) 555-0148",
  phoneHref: "tel:+18435550148",
  booking: "https://papercranewellness.clientsecure.me",
  address: "1007 Johnnie Dodds Blvd, Suite #129, Mount Pleasant, SC 29464",
  virtual: "Virtual therapy anywhere in South Carolina; in-person therapy in Mount Pleasant.",
  hours: "Mon\u2013Fri by appointment",
  insurance: "In-network with Cigna and Aetna. Superbills available for out-of-network reimbursement.",
};

export const nav: { label: string; to: string; children?: { label: string; to: string; note: string }[] }[] = [
  { label: "About", to: "/about" },
  {
    label: "Specialties",
    to: "/specialties",
    children: [
      { label: "Trauma, PTSD & EMDR", to: "/trauma", note: "EMDR, Prolonged Exposure, Trauma-Informed Yoga" },
      { label: "Neurodivergent Affirming", to: "/neurodivergent", note: "Embrace your quirks, not just tolerate them" },
      { label: "Individual Therapy", to: "/individual", note: "For adults navigating life\u2019s challenges" },
    ],
  },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export const specialties = [
  {
    slug: "/trauma",
    n: "01",
    title: "Trauma, PTSD, EMDR & Prolonged Exposure",
    short: "If trauma has you feeling stuck or PTSD has taken the wheel, I use EMDR, Prolonged Exposure Therapy, and Trauma-Informed Yoga to help you reclaim your life, step by step.",
    quote: "I can sit with you and I can be an anchor. I can also be an arrow to help you find some relief and lightness. Nothing is too scary or too much.",
    intro: "Trauma casts a long shadow. Maybe something from your past still hangs over you like a dark cloud. It could be the sharp pain from obvious traumas like abuse or assault, the nuanced sting of relationship or job loss, or the dull ache from being constantly put down or pushed aside. These experiences stick around, heavy and hidden.",
    vision: "Envision your emotions as waves you ride, not torrents that drag you under. Picture yourself feeling calm and present, not on edge waiting for the next trigger. Therapy can help you sleep soundly, finally free from the relentless replay of anxious thoughts.",
    approach: "Therapy with me is about stepping into a space where you can (finally) let your guard down. I\u2019m not here to judge you or to fix you. I\u2019m here to sit with you in the middle of the mess and the pain, working together to find ways forward.",
    whoFor: [
      "Anyone tired of old memories interrupting everyday life.",
      "People who find themselves steering clear of certain spots or faces because they stir up too much anxiety.",
      "Those who feel overwhelmed by big emotions from small triggers, like a sudden loud noise or an offhand comment.",
      "Anyone who wants to stop feeling controlled by their past, ready to write their own rules for living.",
    ],
    techniques: [
      { name: "EMDR", body: "This therapy goes beyond simply revisiting traumatic events; it involves changing how your brain reacts to these memories. Through structured sessions, you\u2019ll find new peace as you safely reprocess past traumas, making them less overpowering." },
      { name: "Prolonged Exposure Therapy", body: "Step by step, this therapy helps you face the memories and places you\u2019ve been steering clear of. With each session, you\u2019ll feel these old fears lose their grip, giving you back control." },
      { name: "Trauma-Informed Yoga", body: "Find your way back to your body through soothing, mindful practices in a nurturing space where you can heal and grow stronger, even after deep trauma." },
    ],
    cta: "Pave your way to a life where YOU are in control.",
  },
  {
    slug: "/neurodivergent",
    n: "02",
    title: "Neurodivergent Affirming Therapy",
    short: "I specialize in creating a supportive, understanding environment that respects and celebrates neurodivergent ways of experiencing the world.",
    quote: "Embracing special interests is self-care, too.",
    intro: "Imagine your quirks being celebrated, not just tolerated. Imagine discussing your latest project or passion without feeling the need to hold back or simplify things just to fit in. Here, your differences aren\u2019t just accepted; they\u2019re your superpowers.",
    vision: "Whether you\u2019re chomping at the bit to chart a life course or you just want to talk about dinosaurs or planets to me for an hour, I\u2019m here for it.",
    approach: "I\u2019ve been where you are\u2014I\u2019ve navigated the choppy waters of feeling out of place and learned how to embrace my neurodivergence without masking all the time. If you\u2019re sick of trying to reshape yourself to fit into someone else\u2019s idea of normal, I\u2019m ready to help you break out and flourish.",
    whoFor: [
      "Anyone feeling out of sync with the \u2018normal\u2019 social script.",
      "Individuals frequently misunderstood or misinterpreted by others.",
      "Those who feel pressured to mask their true selves.",
      "Neurodivergent individuals seeking strategies that embrace their unique perspectives.",
    ],
    techniques: [],
    cta: "Embrace your true self.",
  },
  {
    slug: "/individual",
    n: "03",
    title: "Individual Therapy for Adults",
    short: "Life\u2019s tough. Let\u2019s talk it out. Whether you\u2019re dealing with big changes, daily stressors, or just need a sounding board, I\u2019m here to listen and help you navigate.",
    quote: "I don\u2019t think people are broken. I think things happen to us that teach us to be something other than our most real selves. Getting back to that is sometimes a painful process but it doesn\u2019t have to suck, and you don\u2019t have to do it alone.",
    intro: "Whether it\u2019s the never-ending to-do list at work that leaves you drained before lunch or the stress of trying to balance bills, family/friend obligations, and a bit of me-time, you\u2019re not alone. Maybe you\u2019re a young adult who\u2019s just starting out, feeling both excited and terrified of the real world. Or perhaps you\u2019re battling addictions that keep pulling you back just when you think you\u2019re making progress.",
    vision: "We\u2019ll tackle the mess together, finding what genuinely works for you. We\u2019ll figure out how you can express your needs at work without fearing backlash or how you can manage your home life without feeling like you\u2019re in a constant state of chaos. This isn\u2019t about making you fit better into your life; it\u2019s about reshaping your life to fit you.",
    approach: "",
    whoFor: [
      "Recent graduates tackling the sudden shift from structured school life to the open-ended challenges of adulthood.",
      "Professionals overwhelmed by the pursuit of a \u2018successful\u2019 career while maintaining personal happiness.",
      "Individuals navigating recovery from addictions, looking for understanding and non-judgmental support.",
      "Perfectionists who are tired of their own high standards robbing them of joy and satisfaction.",
    ],
    techniques: [],
    cta: "Let\u2019s create a plan that works for you.",
  },
];

export const press = [
  { outlet: "Business Insider" },
  { outlet: "Benzinga" },
  { outlet: "Associated Press" },
  { outlet: "Street Insider" },
  { outlet: "Asia One" },
];

export const faqs = [
  {
    q: "Where can you see clients?",
    a: "I am available virtually throughout the state of South Carolina. Unfortunately, if you are out of state I cannot provide services. In-person sessions are available at my office in Mount Pleasant.",
  },
  {
    q: "What is Trauma-Informed Yoga?",
    a: "Trauma-Informed Yoga is an approach to teaching and practicing yoga that makes it suitable for everybody and every body. I practice mostly Yin Yoga, which focuses on long, gentle stretches rather than balance or strength. Trauma-Informed yoga can be used as an adjunct to treatment, or as a stand-alone service. It can be done in-person or virtually.",
  },
  {
    q: "What is EMDR?",
    a: "Eye Movement Desensitization and Reprocessing Therapy is an evidence-based treatment for trauma and post-traumatic stress disorder. It is a way of gently re-engaging with traumatic memories or experiences to make them less triggering.",
  },
  {
    q: "What is Prolonged Exposure Therapy?",
    a: "Prolonged Exposure Therapy is an evidence-based treatment for post-traumatic stress disorder based in a Cognitive top-down approach. It combines two types of exposure therapies (imaginary and in-vivo) to reduce trauma symptoms.",
  },
  {
    q: "How long is treatment?",
    a: "Most people see symptom relief in 8\u201310 sessions, but many people stay in therapy longer for ongoing, regular support. Length of treatment is a collaborative discussion.",
  },
  {
    q: "Do you accept insurance?",
    a: "Yes. I am in network with Cigna and Aetna. I can provide you with a superbill to submit to your insurance company for possible reimbursement.",
  },
  {
    q: "Where is the office?",
    a: "1007 Johnnie Dodds Blvd. Suite #129, Mount Pleasant, SC 29464.",
  },
];

export const testimonials = [
  {
    text: "Rebekah is knowledgeable, a great listener, and helped me unravel 20+ years of keeping stuff to myself and struggling with mental health issues.",
    source: "Client Testimonial",
  },
  {
    text: "Rebekah challenges me to think about things in ways that help me to grow while also offering practical ways to tackle my needs.",
    source: "Client Testimonial",
  },
  {
    text: "It only took about two minutes before I felt totally comfortable. HIGHLY recommend!",
    source: "Client Testimonial",
  },
];

export const endorsements = [
  {
    text: "Rebekah is an exceptional therapist. Her unwavering dedication to evidence-based approaches and her compassionate demeanor create a safe and supportive environment for clients to explore and heal from traumatic experiences.",
    from: "Professional Endorsement",
  },
  {
    text: "Rebekah is a therapist who blends empathy, intellect, and creativity to meet each of her clients wherever they are. Beyond her impressive clinical skill set, Rebekah is kind and affirming with a talent for helping clients to feel truly understood.",
    from: "Kat Leighton \u2014 Professional Endorsement",
  },
];

export const credentials = [
  ["LISW-CP", "Licensed Independent Social Worker \u2014 Clinical Practice"],
  ["MSW", "University of South Carolina \u2014 Master of Social Work"],
  ["BA", "Boston University \u2014 Anthropology & Religion"],
  ["EMDR", "EMDR Humanitarian Assistance Program"],
  ["RYT-200", "Trauma-Informed Yoga Teacher"],
];

export const healing = [
  "Waking up refreshed with your first thought about the day ahead, not the ghosts of yesterday.",
  "Diving into conversations with more ease, genuinely laughing, and leaving gatherings feeling energized, not drained.",
  "Tackling work with clarity and confidence.",
  "Handling setbacks with a cool head and seeing challenges as bumps in the road, not roadblocks.",
  "Communicating openly in relationships, feeling valued and understood without having to mask your true self.",
  "Celebrating your quirks and using them as tools, not hindrances, in your daily life.",
];

export const funFacts = [
  { q: "Favorite Game of Thrones house?", a: "House Martell \u2014 unbowed, unbent, unbroken." },
  { q: "Favorite kind of cheese?", a: "The kind that is given to me!" },
  { q: "Which superpower?", a: "Teleportation, no question \u2014 never deal with Charleston traffic again." },
];
