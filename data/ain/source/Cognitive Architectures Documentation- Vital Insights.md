
## 1. LIDA (Learning Intelligent Distribution Agent)

### Overview

LIDA is a cognitive architecture that attempts to model a broad spectrum of cognition in biological systems, from low-level perception/action to high-level reasoning. Developed primarily by Stan Franklin and colleagues at the University of Memphis, the LIDA architecture is empirically grounded in cognitive science and cognitive neuroscience.

### Core Principles

- **Cognitive Cycles**: Much of human cognition functions by means of frequently iterated (~10 Hz) interactions, called cognitive cycles, which serve as the "atoms" of cognition of which higher-level cognitive processes are composed.
- **Global Workspace Theory**: LIDA combines sophisticated action selection, motivation via emotions, a centrally important attention mechanism, and multimodal instructionalist and selectionist learning.
- **Hybrid Architecture**: Though it is neither symbolic nor strictly connectionist, LIDA is a hybrid architecture in that it employs a variety of computational mechanisms, chosen for their psychological plausibility.

### Key Components

- **Modules**: The LIDA architecture uses several modules, including variants of the Copycat Architecture, sparse distributed memory, the schema mechanism, the Behavior Net, and the subsumption architecture.
- **Learning Mechanisms**: LIDA has a wide range of learning mechanisms including attentional, declarative, motivational, procedural, perceptual, spatial, and sensorimotor.
- **Conscious Learning Hypothesis**: Perhaps the most essential constraint is the Conscious Learning Hypothesis from Global Workspace Theory, which asserts that all significant learning requires consciousness.

### Implementation

- The LIDA Framework is a generic and customizable computational implementation of the LIDA model, programmed in Java.
- The Framework provides for multithreading support. Its implementation adheres to several well-established design principles, and best programming practices.

### Applications

- Originally developed for the US Navy to automate personnel distribution tasks
- Cognitive tutoring systems
- Medical diagnosis systems
- Non-routine problem solving mechanisms

---

## 2. SOAR

### Overview

Soar is a cognitive architecture, originally created by John Laird, Allen Newell, and Paul Rosenbloom at Carnegie Mellon University. The goal of the Soar project is to develop the fixed computational building blocks necessary for general intelligent agents – agents that can perform a wide range of tasks and encode, use, and learn all types of knowledge to realize the full range of cognitive capabilities found in humans.

### Theoretical Foundation

- **Problem Space Hypothesis**: The original theory of cognition underlying Soar is the Problem Space Hypothesis, which contends that all goal-oriented behavior can be cast as search through a space of possible states (a problem space) while attempting to achieve a goal.
- **Serial Bottleneck with Parallel Processing**: Although only a single operator can be selected at each step, forcing a serial bottleneck, the processes of selection and application are implemented through parallel rule firings, which provide context-dependent retrieval of procedural knowledge.

### Key Mechanisms

- **Impasse Resolution**: If the knowledge to select or apply an operator is incomplete or uncertain, an impasse arises and the architecture automatically creates a substate. In the substate, the same process of problem solving is recursively used, but with the goal to retrieve or discover knowledge so that decision making can continue.
- **Memory Systems**: The current version of Soar features major extensions, adding reinforcement learning, semantic memory, episodic memory, mental imagery, and an appraisal-based model of emotion.

### Implementation

- The current architecture is written in a combination of C and C++, and is freely available (BSD license) at the project's website.
- Soar can interface with external language environments including C++, Java, Tcl, and Python through SWIG-based bindings included with its distribution.
- JSoar is an implementation of Soar written in Java, maintained by SoarTech

### Applications

- NTD-Soar was a simulation of the NASA Test Director (NTD), the person responsible for coordinating the preparation of the NASA Space Shuttle before launch.
- Virtual humans have integrated capabilities of perception, natural-language understanding, emotions, body control, and action.
- Game AI agents have been built using Soar for games such as StarCraft, Quake II, Descent 3, Unreal Tournament, and Minecraft.

---

## 3. ACT-R (Adaptive Control of Thought—Rational)

### Overview

ACT-R is a cognitive architecture mainly developed by John Robert Anderson and Christian Lebiere at Carnegie Mellon University. Like any cognitive architecture, ACT-R aims to define the basic and irreducible cognitive and perceptual operations that enable the human mind.

### Theoretical Framework

- **Rational Analysis**: The basic assumption of Rational Analysis is that cognition is optimally adaptive, and precise estimates of cognitive functions mirror statistical properties of the environment.
- **Hybrid Nature**: ACT-R is a hybrid cognitive architecture. Its symbolic structure is a production system; the subsymbolic structure is represented by a set of massively parallel processes that can be summarized by a number of mathematical equations.

### Architecture Components

- **Production System**: Only one such production can be executed at a given moment. That production, when executed, can modify the buffers and thus change the state of the system. Thus, in ACT-R, cognition unfolds as a succession of production firings.
- **Subsymbolic Mechanisms**: If several productions match the state of the buffers, a subsymbolic utility equation estimates the relative cost and benefit associated with each production and decides to select for execution the production with the highest utility.
- **Memory Retrieval**: Whether (or how fast) a fact can be retrieved from declarative memory depends on subsymbolic retrieval equations, which take into account the context and the history of usage of that fact.

### Implementation

- The interpreter itself is written in Common Lisp, and might be loaded into any of the Common Lisp language distributions.
- This enables researchers to specify models of human cognition in the form of a script in the ACT-R language.

### Applications

- Education (cognitive tutoring systems) to "guess" the difficulties that students may have and provide focused help
- Some of the most successful applications, the Cognitive Tutors for Mathematics, are used in thousands of schools across the country.
- Computer-generated forces to provide cognitive agents
- fMRI integration for brain activity prediction

---

## 4. POET (Paired Open-Ended Trailblazer)

### Overview

POET is an algorithm that leverages open-endedness to push the bounds of machine learning. The Paired Open-Ended Trailblazer (POET) algorithm combines principles to produce a practical approach to generating an endless curriculum.

### Core Concepts

- **Open-Ended Evolution**: POET pairs the generation of environmental challenges and the optimization of agents to solve those challenges. It simultaneously explores many different paths through the space of possible problems and solutions and, critically, allows these stepping-stone solutions to transfer between problems if better, catalyzing innovation.
- **Dynamic Co-evolution**: POET is an innovative approach to open-ended learning and evolution in AI, where both agents and their environments evolve simultaneously.
- **Transfer Learning**: An intriguing implication is the opportunity to transfer solutions among environments, reflecting the view that innovation is a circuitous and unpredictable process.

### Key Features

- Generates diverse and sophisticated behaviors
- Creates and solves a wide range of environmental challenges
- Solutions that cannot be achieved by direct optimization alone
- Autonomous curriculum generation without human intervention

### Development Context

- Developed at Uber AI Labs by researchers including Rui Wang, Joel Lehman, Jeff Clune, and Ken Stanley
- Won a Best Paper Award at GECCO 2019
- Open-sourced for research use

### Applications

- 2-D obstacle course domains
- Robotics for adaptive behavior
- Virtual environments for agent training
- Potential applications in autonomous vehicles and game AI

---

## 5. MicroPsi

### Overview

The Psi theory of human action regulation is a candidate for a cognitive architecture that tackles the problem of the interrelation of motivation and emotion with cognitive processes. We have transferred this theory into a cognitive modeling framework, implemented as an AI architecture, called MicroPsi.

### Theoretical Foundation

- **Psi Theory**: Psi-theory, developed by Dietrich Dörner at the University of Bamberg, is a systemic psychological theory covering human action regulation, intention selection and emotion. It models the human mind as an information processing agent, controlled by a set of basic physiological, social and cognitive drives.
- **Motivated Cognition**: The MicroPsi project explores broad models of cognition, built on a motivational system that gives rise to autonomous social and cognitive behaviors.

### Architecture Components

- **Executable Semantic Networks**: Our agents are based on executable semantic networks (for lack of a better name, we refer to them as AEP node nets).
- **Hierarchical Networks**: Psi-theory suggests hierarchical networks of nodes as a universal mode of representation for declarative, procedural and tacit knowledge.
- **Drive System**: Cognitive drives (reduction of uncertainty, and competence). Uncertainty reduction is maintained through exploration and frustrated by mismatches with expectations and/or failures to create anticipations.

### Key Features

- **Neuro-symbolic Representations**: MicroPsi agents are grounded AI agents, with neuro-symbolic representations, affect, top-down/bottom-up perception, and autonomous decision making.
- **Emotional Modulation**: Cognitive processing is subject to global modulatory parameters, which adjust the cognitive resources of the system to the environmental and internal situation.
- **Reinforcement Learning**: Changes in systemic demands are reflected in a "pleasure" or "distress signal", which is used for reinforcement learning of associations between demands and goals.

### Implementation

- The framework has been written in Java and is provided as a plugin for the popular Eclipse system. Thus, it is truly platform independent.
- Python version of cognitive architecture MicroPsi available on GitHub
- Integration with OpenCog architecture through OpenPsi implementation

### Development Context

- Originally developed by Joscha Bach at Humboldt University of Berlin and University of Osnabrück
- Extended at MIT Media Lab
- Commercial applications through Micropsi Industries for robotic vision

---

## Comparative Analysis

### Commonalities

- All architectures aim to model human-level cognition
- Emphasis on learning and adaptation
- Integration of multiple cognitive processes
- Support for both symbolic and subsymbolic processing (in varying degrees)

### Key Differentiators

**LIDA**: Focus on consciousness and Global Workspace Theory, cognitive cycles **SOAR**: Problem space hypothesis, impasse-driven subgoaling **ACT-R**: Rational analysis, strong empirical grounding, cognitive modeling **POET**: Open-ended evolution, not a cognitive architecture but an evolutionary algorithm **MicroPsi**: Emotion and motivation as central organizing principles, Psi theory

### Application Domains

- **Cognitive Modeling**: ACT-R, LIDA, MicroPsi
- **Educational Systems**: ACT-R (Cognitive Tutors), LIDA
- **Robotics**: SOAR, MicroPsi, POET
- **Game AI**: SOAR, POET
- **Military/Defense**: SOAR (NASA), LIDA (US Navy)
- **Open-Ended Learning**: POET

### Current Status

- **SOAR**: Version 9.6.4, actively maintained at University of Michigan
- **ACT-R**: Actively developed at Carnegie Mellon
- **LIDA**: Ongoing research at University of Memphis
- **POET**: Open-sourced, continued research in evolutionary AI
- **MicroPsi**: Both academic research and commercial applications