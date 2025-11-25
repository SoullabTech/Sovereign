/**
 * THE FORGE - Wisdom Library
 *
 * Wisdom teachings from Kelly's lineages, organized by elemental location.
 * Each quote is a "piece of mana" - nourishment for the soul's journey.
 *
 * "Fire 1 exists in all worlds, in different ways."
 */

export type Element = 'fire' | 'water' | 'earth' | 'air';
export type Phase = 'begins' | 'deepens' | 'integrates';
export type Tradition = 'taoist' | 'buddhist' | 'tibetan' | 'indigenous' | 'jungian' | 'mystical' | 'regression' | 'shamanic';

export interface WisdomTeaching {
  quote: string;
  teacher: string;
  tradition: Tradition;
  element: Element;
  phase: Phase;
  source?: string;
  practiceLink?: string;
}

/**
 * FIRE TEACHINGS - Initiation, Vision, Catalyst, Beginning
 */

const fireBegins: WisdomTeaching[] = [
  {
    quote: "In the beginning, the dream appears as solid as waking life. Learn to recognize the dream.",
    teacher: "Tenzin Wangyal Rinpoche",
    tradition: "tibetan",
    element: "fire",
    phase: "begins",
    source: "Tibetan Dream Yoga"
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    teacher: "Lao Tzu",
    tradition: "taoist",
    element: "fire",
    phase: "begins",
    source: "Tao Te Ching"
  },
  {
    quote: "Vision without action is merely a dream. Action without vision just passes the time. Vision with action can change the world.",
    teacher: "Indigenous Wisdom",
    tradition: "indigenous",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "The privilege of a lifetime is to become who you truly are.",
    teacher: "Carl Jung",
    tradition: "jungian",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "When the student is ready, the teacher appears.",
    teacher: "Buddhist Teaching",
    tradition: "buddhist",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "There is no greater agony than bearing an untold story inside you.",
    teacher: "Maya Angelou",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "Start where you are. Use what you have. Do what you can.",
    teacher: "Arthur Ashe",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "The cave you fear to enter holds the treasure you seek.",
    teacher: "Joseph Campbell",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "If you are brave enough to say goodbye, life will reward you with a new hello.",
    teacher: "Paulo Coelho",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "Creativity is not a rare ability. It is not difficult to access. Creativity is a fundamental aspect of being human. It's our birthright.",
    teacher: "Rick Rubin",
    tradition: "mystical",
    element: "fire",
    phase: "begins",
    source: "The Creative Act"
  },
  {
    quote: "Change the way you look at things and the things you look at change.",
    teacher: "Wayne Dyer",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "Tell me, what is it you plan to do with your one wild and precious life?",
    teacher: "Mary Oliver",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "The only journey is the one within.",
    teacher: "Rainer Maria Rilke",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "You must give birth to your images. They are the future waiting to be born.",
    teacher: "Rainer Maria Rilke",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  },
  {
    quote: "The beginning of love is to let those we love be perfectly themselves.",
    teacher: "Thomas Merton",
    tradition: "mystical",
    element: "fire",
    phase: "begins"
  }
];

const fireDeepens: WisdomTeaching[] = [
  {
    quote: "The fire that burns brightest must be fed with presence. Tend your inner flame.",
    teacher: "Mantak Chia",
    tradition: "taoist",
    element: "fire",
    phase: "deepens",
    source: "Taoist Internal Alchemy"
  },
  {
    quote: "In the depths of winter, I finally learned that within me there lay an invincible summer.",
    teacher: "Albert Camus",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "Your vision will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.",
    teacher: "Carl Jung",
    tradition: "jungian",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "The soul always knows what to do to heal itself. The challenge is to silence the mind.",
    teacher: "Caroline Myss",
    tradition: "mystical",
    element: "fire",
    phase: "deepens",
    source: "Sacred Contracts"
  },
  {
    quote: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.",
    teacher: "Brené Brown",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "You can cut all the flowers but you cannot keep spring from coming.",
    teacher: "Pablo Neruda",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "The warrior who trusts his path doesn't need to prove the other is wrong.",
    teacher: "Paulo Coelho",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.",
    teacher: "Audre Lorde",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science.",
    teacher: "Albert Einstein",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "I have been a seeker and I still am, but I stopped asking the books and the stars. I started listening to the teaching of my Soul.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "The man who has no imagination has no wings.",
    teacher: "Muhammad Ali",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "May the nourishment of the earth be yours, may the clarity of light be yours, may the fluency of the ocean be yours, may the protection of the ancestors be yours.",
    teacher: "John O'Donohue",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  },
  {
    quote: "Iron rusts from disuse; water loses its purity from stagnation... even so does inaction sap the vigor of the mind.",
    teacher: "Leonardo da Vinci",
    tradition: "mystical",
    element: "fire",
    phase: "deepens"
  }
];

const fireIntegrates: WisdomTeaching[] = [
  {
    quote: "We are not going in circles, we are going upwards. The path is a spiral; we have already climbed many steps.",
    teacher: "Hermann Hesse",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "When you realize nothing is lacking, the whole world belongs to you.",
    teacher: "Lao Tzu",
    tradition: "taoist",
    element: "fire",
    phase: "integrates",
    source: "Tao Te Ching"
  },
  {
    quote: "The wound is the place where the Light enters you.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "To see a World in a Grain of Sand, And a Heaven in a Wild Flower, Hold Infinity in the palm of your hand, And Eternity in an hour.",
    teacher: "William Blake",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.",
    teacher: "Goethe",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "The creative person is both more primitive and more cultivated, more destructive and more constructive, crazier and saner, than the average person.",
    teacher: "Marie-Louise von Franz",
    tradition: "jungian",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "He who has a why to live can bear almost any how.",
    teacher: "Friedrich Nietzsche",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "You are never alone or helpless. The force that guides the stars guides you too.",
    teacher: "Shrii Shrii Anandamurti",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  },
  {
    quote: "Become who you are.",
    teacher: "Friedrich Nietzsche",
    tradition: "mystical",
    element: "fire",
    phase: "integrates"
  }
];

/**
 * WATER TEACHINGS - Emotion, Depth, Soul, Feeling
 */

const waterBegins: WisdomTeaching[] = [
  {
    quote: "Water is fluid, soft, and yielding. But water will wear away rock, which is rigid and cannot yield.",
    teacher: "Lao Tzu",
    tradition: "taoist",
    element: "water",
    phase: "begins",
    source: "Tao Te Ching"
  },
  {
    quote: "You can't stop the waves, but you can learn to surf.",
    teacher: "Jon Kabat-Zinn",
    tradition: "buddhist",
    element: "water",
    phase: "begins"
  },
  {
    quote: "The soul enters through a wound.",
    teacher: "James Hillman",
    tradition: "jungian",
    element: "water",
    phase: "begins"
  },
  {
    quote: "Between lives, we rest in the ocean of consciousness. We remember who we truly are.",
    teacher: "Michael Newton",
    tradition: "regression",
    element: "water",
    phase: "begins",
    source: "Life Between Lives"
  },
  {
    quote: "Feelings like disappointment, embarrassment, irritation, resentment, anger, jealousy, and fear are actually very clear moments. They're like messengers.",
    teacher: "Pema Chödrön",
    tradition: "tibetan",
    element: "water",
    phase: "begins"
  },
  {
    quote: "The most beautiful people we have known are those who have known defeat, known suffering, known struggle, known loss, and have found their way out of the depths.",
    teacher: "Elisabeth Kübler-Ross",
    tradition: "mystical",
    element: "water",
    phase: "begins"
  },
  {
    quote: "There is a crack in everything. That's how the light gets in.",
    teacher: "Leonard Cohen",
    tradition: "mystical",
    element: "water",
    phase: "begins"
  },
  {
    quote: "The deeper that sorrow carves into your being, the more joy you can contain.",
    teacher: "Kahlil Gibran",
    tradition: "mystical",
    element: "water",
    phase: "begins"
  }
];

const waterDeepens: WisdomTeaching[] = [
  {
    quote: "One does not become enlightened by imagining figures of light, but by making the darkness conscious.",
    teacher: "Carl Jung",
    tradition: "jungian",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Your biography becomes your biology. Your emotional history lives in your cells.",
    teacher: "Caroline Myss",
    tradition: "mystical",
    element: "water",
    phase: "deepens",
    source: "Anatomy of the Spirit"
  },
  {
    quote: "The cure for the pain is in the pain.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "We don't see things as they are, we see them as we are.",
    teacher: "Anaïs Nin",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Nothing ever goes away until it teaches us what we need to know.",
    teacher: "Pema Chödrön",
    tradition: "tibetan",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "The wound is where the light enters you.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "We must be willing to get rid of the life we've planned, so as to have the life that is waiting for us.",
    teacher: "Joseph Campbell",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Alchemy is the art of transformation, and the soul work is the ultimate alchemy.",
    teacher: "Marion Woodman",
    tradition: "jungian",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "If you will stay with the feeling, the feeling will lead you home to yourself.",
    teacher: "Geneen Roth",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "The most precious gift we can offer others is our presence. When mindfulness embraces those we love, they will bloom like flowers.",
    teacher: "Thich Nhat Hanh",
    tradition: "buddhist",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Suffering is not holding you. You are holding suffering. When you become good at the art of letting sufferings go, then you'll come to realize how unnecessary it was for you to drag those burdens around with you.",
    teacher: "Ajahn Chah",
    tradition: "buddhist",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "The soul always knows what to do to heal itself. The challenge is to silence the mind.",
    teacher: "Caroline Myss",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.",
    teacher: "Viktor Frankl",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "The cave you fear to enter holds the treasure you seek.",
    teacher: "Joseph Campbell",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "When I run after what I think I want, my days are a furnace of stress and anxiety. If I sit in my own place of patience, what I need flows to me.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "The wound is where the light enters you.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Sell your cleverness and buy bewilderment.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "We cannot choose our external circumstances, but we can always choose how we respond to them.",
    teacher: "Epictetus",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "Difficulties strengthen the mind, as labor does the body.",
    teacher: "Seneca",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  },
  {
    quote: "It is not because things are difficult that we do not dare; it is because we do not dare that things are difficult.",
    teacher: "Seneca",
    tradition: "mystical",
    element: "water",
    phase: "deepens"
  }
];

const waterIntegrates: WisdomTeaching[] = [
  {
    quote: "The privilege of a lifetime is being who you are.",
    teacher: "Joseph Campbell",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "Let the waters settle and you will see the moon and stars mirrored in your own being.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "Only when we are brave enough to explore the darkness will we discover the infinite power of our light.",
    teacher: "Brené Brown",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "What you are is what you have been. What you'll be is what you do now.",
    teacher: "Buddha",
    tradition: "buddhist",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "The bird fights its way out of the egg. The egg is the world. Whoever will be born must destroy a world.",
    teacher: "Hermann Hesse",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "Don't take anything personally. Nothing others do is because of you. What others say and do is a projection of their own reality.",
    teacher: "Don Miguel Ruiz",
    tradition: "indigenous",
    element: "water",
    phase: "integrates",
    source: "The Four Agreements"
  },
  {
    quote: "In the midst of winter, I found there was, within me, an invincible summer.",
    teacher: "Albert Camus",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "The more clearly you understand yourself and your emotions, the more you become a lover of what is.",
    teacher: "Baruch Spinoza",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "Existence precedes essence. We are condemned to be free, and in that freedom lies our responsibility to create meaning.",
    teacher: "Jean-Paul Sartre",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "The fundamental mood of the soul is anxiety. It reveals the nothing and brings us face to face with the uncanniness of existence.",
    teacher: "Martin Heidegger",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "The masculine is always positioned at the edge, at the borderline, on the frontier. Going to the edge and looking into the unknown is what he does.",
    teacher: "Robert Bly",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "When a man makes himself into zero, he becomes a well of love, a fountain of grace, a lake of compassion.",
    teacher: "Robert Bly",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "The psyche is not of today; its ancestry goes back many millions of years. Individual consciousness is only the flower and the fruit of a season, sprung from the perennial rhizome beneath the earth.",
    teacher: "Stanislav Grof",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "There is no coming to consciousness without pain.",
    teacher: "Carl Jung",
    tradition: "jungian",
    element: "water",
    phase: "integrates"
  },
  {
    quote: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "water",
    phase: "integrates"
  }
];

/**
 * EARTH TEACHINGS - Structure, Embodiment, Building, Grounding
 */

const earthBegins: WisdomTeaching[] = [
  {
    quote: "Before enlightenment: chop wood, carry water. After enlightenment: chop wood, carry water.",
    teacher: "Zen Proverb",
    tradition: "buddhist",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "The body is your temple. Keep it pure and clean for the soul to reside in.",
    teacher: "B.K.S. Iyengar",
    tradition: "mystical",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "Every step upon the Earth is a prayer.",
    teacher: "Indigenous Wisdom (Lakota)",
    tradition: "indigenous",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "The way is not in the sky. The way is in the heart.",
    teacher: "Buddha",
    tradition: "buddhist",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "Nature does not hurry, yet everything is accomplished.",
    teacher: "Lao Tzu",
    tradition: "taoist",
    element: "earth",
    phase: "begins",
    source: "Tao Te Ching"
  },
  {
    quote: "The Earth does not belong to us. We belong to the Earth.",
    teacher: "Chief Seattle",
    tradition: "indigenous",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "To be grounded is to be in your body, present to the moment, aware of your feet on the ground.",
    teacher: "Jack Kornfield",
    tradition: "buddhist",
    element: "earth",
    phase: "begins"
  },
  {
    quote: "The rhythm of the body, the melody of the mind, and the harmony of the soul create the symphony of life.",
    teacher: "B.K.S. Iyengar",
    tradition: "mystical",
    element: "earth",
    phase: "begins"
  }
];

const earthDeepens: WisdomTeaching[] = [
  {
    quote: "Root to rise. Ground deeply to reach higher.",
    teacher: "Yoga Teaching",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "The chi (life force) follows the mind. Where attention goes, energy flows.",
    teacher: "Mantak Chia",
    tradition: "taoist",
    element: "earth",
    phase: "deepens",
    source: "Chi Kung"
  },
  {
    quote: "What you practice grows stronger.",
    teacher: "Buddhist Teaching",
    tradition: "buddhist",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "The body keeps the score. Healing requires embodiment.",
    teacher: "Bessel van der Kolk",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "Do your practice and all is coming.",
    teacher: "Pattabhi Jois",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "The longest journey you will ever take is the 18 inches from your head to your heart.",
    teacher: "Andrew Bennett",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "Your body is the ground metaphor of your life, the expression of your existence. It is your Bible, your encyclopedia, your life story.",
    teacher: "Gabrielle Roth",
    tradition: "shamanic",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "To walk in nature is to witness a thousand miracles.",
    teacher: "Mary Davis",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  },
  {
    quote: "The cure for anything is salt water: sweat, tears, or the sea.",
    teacher: "Isak Dinesen",
    tradition: "mystical",
    element: "earth",
    phase: "deepens"
  }
];

const earthIntegrates: WisdomTeaching[] = [
  {
    quote: "Heaven and Earth united in you. As above, so below, so within.",
    teacher: "Hermetic Wisdom",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.",
    teacher: "Pierre Teilhard de Chardin",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "Walking, I am listening to a deeper way. Suddenly all my ancestors are behind me. Be still, they say. Watch and listen. You are the result of the love of thousands.",
    teacher: "Linda Hogan (Chickasaw)",
    tradition: "indigenous",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "The question is not what you look at, but what you see.",
    teacher: "Henry David Thoreau",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "Always do your best. Your best is going to change from moment to moment; it will be different when you are healthy as opposed to sick. Under any circumstance, simply do your best, and you will avoid self-judgment, self-abuse, and regret.",
    teacher: "Don Miguel Ruiz",
    tradition: "indigenous",
    element: "earth",
    phase: "integrates",
    source: "The Four Agreements"
  },
  {
    quote: "The true mystery of the world is the visible, not the invisible.",
    teacher: "Oscar Wilde",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "To pay attention, this is our endless and proper work.",
    teacher: "Mary Oliver",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    teacher: "Marcus Aurelius",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "It's not what happens to you, but how you react to it that matters.",
    teacher: "Epictetus",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  },
  {
    quote: "The shamanic journey and the Jungian path are one: both descend into the unconscious to retrieve lost soul fragments and return them to wholeness.",
    teacher: "Dr. Michael Smith",
    tradition: "jungian",
    element: "earth",
    phase: "integrates",
    source: "Jung and Shamanism"
  },
  {
    quote: "The sacred reveals itself through the profane. Every stone, every tree, every moment is potentially a hierophany - a manifestation of the sacred.",
    teacher: "Mircea Eliade",
    tradition: "mystical",
    element: "earth",
    phase: "integrates"
  }
];

/**
 * AIR TEACHINGS - Communication, Expression, Connection, Sharing
 */

const airBegins: WisdomTeaching[] = [
  {
    quote: "The beginning of wisdom is silence. The second stage is listening.",
    teacher: "Pythagorean Wisdom",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Words are sacred. They deserve respect. If you get the right ones in the right order, you can nudge the world a little.",
    teacher: "Tom Stoppard",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Right speech comes from right mind. Speak truth with compassion.",
    teacher: "Buddhist Teaching",
    tradition: "buddhist",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Your word is your wand. Speak with awareness.",
    teacher: "Florence Scovel Shinn",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Listen with the ear of your heart.",
    teacher: "St. Benedict",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Pay attention. Be astonished. Tell about it.",
    teacher: "Mary Oliver",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  },
  {
    quote: "If you have come to help me, you are wasting your time. But if you have come because your liberation is bound up with mine, then let us work together.",
    teacher: "Lilla Watson (Aboriginal)",
    tradition: "indigenous",
    element: "air",
    phase: "begins"
  },
  {
    quote: "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "air",
    phase: "begins"
  }
];

const airDeepens: WisdomTeaching[] = [
  {
    quote: "Listen to the wind, it talks. Listen to the silence, it speaks. Listen to your heart, it knows.",
    teacher: "Indigenous Wisdom",
    tradition: "indigenous",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "The word made flesh. When inner truth finds outer expression, magic happens.",
    teacher: "Mystical Teaching",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "We know the truth not only by reason, but also by heart.",
    teacher: "Blaise Pascal",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "Your voice is your unique frequency. When you speak your truth, you add your note to the universal symphony.",
    teacher: "Wayne Teasdale",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "The great sea has set me adrift, it moves me as the weed in a great river, earth and the great weather move me, have carried me away, and move my inward parts with joy.",
    teacher: "Uvavnuk (Inuit)",
    tradition: "indigenous",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "The soul should always stand ajar, ready to welcome the ecstatic experience.",
    teacher: "Emily Dickinson",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "We are here to awaken from our illusion of separateness.",
    teacher: "Thich Nhat Hanh",
    tradition: "buddhist",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "When I am liberated by silence, when I am no longer involved in the measurement of life, but in the living of it, I can discover a form of prayer in which there is effectively no distraction.",
    teacher: "Thomas Merton",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "The things you are passionate about are not random, they are your calling.",
    teacher: "Fabienne Fredrickson",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "Conversation is the way you socialize the imagination.",
    teacher: "David Whyte",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  },
  {
    quote: "I have learned things in the dark that I could never have learned in the light, things that have saved my life over and over again.",
    teacher: "Parker J. Palmer",
    tradition: "mystical",
    element: "air",
    phase: "deepens"
  }
];

const airIntegrates: WisdomTeaching[] = [
  {
    quote: "The mystic sees the ineffable, and it is enough. The mystic shares the ineffable, and the world transforms.",
    teacher: "Wayne Teasdale",
    tradition: "mystical",
    element: "air",
    phase: "integrates",
    source: "The Mystic Heart"
  },
  {
    quote: "In the silence between words, the truth speaks loudest.",
    teacher: "Zen Teaching",
    tradition: "buddhist",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "The ultimate mystery is one's own self. The soul and spirit are one.",
    teacher: "Tenzin Wangyal Rinpoche",
    tradition: "tibetan",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "May you experience each day as a sacred gift woven around the heart of wonder.",
    teacher: "John O'Donohue",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "Thought and consciousness are not the same thing. What is required is a much more subtle approach, seeing the whole process of thought as just one aspect of an overall totality.",
    teacher: "David Bohm",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "The world is not a problem to be solved; it is a living being to which we belong.",
    teacher: "Llewellyn Vaughan-Lee",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "It's not what you look at that matters, it's what you see.",
    teacher: "Henry David Thoreau",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "Your absence has gone through me like thread through a needle. Everything I do is stitched with its color.",
    teacher: "W.S. Merwin",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "The question is not what we intended ourselves to be, but what we are in the process of becoming.",
    teacher: "Søren Kierkegaard",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "The eye through which I see God is the same eye through which God sees me; my eye and God's eye are one eye, one seeing, one knowing, one love.",
    teacher: "Meister Eckhart",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "My Me is God, nor do I recognize any other Me except my God Himself.",
    teacher: "Ibn al-Arabi",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "Do not seek the water, get thirst.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.",
    teacher: "Rumi",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "Only the hand that erases can write the true thing.",
    teacher: "Meister Eckhart",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "The left hemisphere's world is essentially closed to anything beyond its own certainties. The right hemisphere's world is open to the possibility of being in relationship with the Other.",
    teacher: "Iain McGilchrist",
    tradition: "mystical",
    element: "air",
    phase: "integrates",
    source: "The Master and His Emissary"
  },
  {
    quote: "We own our own shadow, or we will disown ourselves.",
    teacher: "Robert A. Johnson",
    tradition: "jungian",
    element: "air",
    phase: "integrates",
    source: "Owning Your Own Shadow"
  },
  {
    quote: "All great truths begin as blasphemies.",
    teacher: "Manly P. Hall",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  },
  {
    quote: "heal yourself, and you will heal\nthe parts of you that still believe\nyou have something to prove",
    teacher: "Yung Pueblo",
    tradition: "mystical",
    element: "air",
    phase: "integrates"
  }
];

/**
 * Wisdom Library - Complete Collection
 */

export const wisdomLibrary: WisdomTeaching[] = [
  // Fire
  ...fireBegins,
  ...fireDeepens,
  ...fireIntegrates,
  // Water
  ...waterBegins,
  ...waterDeepens,
  ...waterIntegrates,
  // Earth
  ...earthBegins,
  ...earthDeepens,
  ...earthIntegrates,
  // Air
  ...airBegins,
  ...airDeepens,
  ...airIntegrates,
];

/**
 * Get wisdom by location
 */
export function getWisdomByLocation(element: Element, phase: Phase): WisdomTeaching[] {
  return wisdomLibrary.filter(w => w.element === element && w.phase === phase);
}

/**
 * Get random wisdom from location
 */
export function getRandomWisdomFromLocation(element: Element, phase: Phase): WisdomTeaching | null {
  const teachings = getWisdomByLocation(element, phase);
  if (teachings.length === 0) return null;
  return teachings[Math.floor(Math.random() * teachings.length)];
}

/**
 * Get wisdom for time of day
 */
export function getWisdomForTimeOfDay(): WisdomTeaching {
  const hour = new Date().getHours();

  // Morning (5am-11am) - Fire/Begins (new day, initiation)
  if (hour >= 5 && hour < 11) {
    const wisdom = getRandomWisdomFromLocation('fire', 'begins');
    return wisdom || wisdomLibrary[0];
  }

  // Midday (11am-3pm) - Earth/Deepens (embodied action)
  if (hour >= 11 && hour < 15) {
    const wisdom = getRandomWisdomFromLocation('earth', 'deepens');
    return wisdom || wisdomLibrary[0];
  }

  // Afternoon (3pm-7pm) - Air/Integrates (expression, synthesis)
  if (hour >= 15 && hour < 19) {
    const wisdom = getRandomWisdomFromLocation('air', 'integrates');
    return wisdom || wisdomLibrary[0];
  }

  // Evening (7pm-11pm) - Water/Deepens (emotional depth, reflection)
  if (hour >= 19 && hour < 23) {
    const wisdom = getRandomWisdomFromLocation('water', 'deepens');
    return wisdom || wisdomLibrary[0];
  }

  // Night (11pm-5am) - Water/Integrates (integration, rest)
  const wisdom = getRandomWisdomFromLocation('water', 'integrates');
  return wisdom || wisdomLibrary[0];
}

/**
 * Get daily wisdom (same for everyone on a given day)
 */
export function getDailyWisdom(): WisdomTeaching {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % wisdomLibrary.length;
  return wisdomLibrary[index];
}
