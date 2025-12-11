;;;; 🧠 Navigator HTTP Server
;;;; Real-time consciousness analysis API using Hunchentoot

(ql:quickload :hunchentoot)
(ql:quickload :cl-json)
(ql:quickload :drakma)

(defpackage #:navigator-http-server
  (:use #:cl #:hunchentoot #:cl-json)
  (:export #:start-navigator-server #:stop-navigator-server))

(in-package #:navigator-http-server)

;;; Global server instance
(defvar *server* nil)

;;; Consciousness analysis structures
(defstruct consciousness-analysis
  patterns
  elemental-balance
  archetypal-state
  spiral-phase
  recommendations
  timestamp)

(defstruct spiralogic-reading
  hexagram
  facet
  interpretation
  protocols
  timestamp)

;;; Protocol database
(defparameter *protocols* (make-hash-table :test 'equal))

(defstruct protocol
  name
  intention
  duration
  steps)

;;; Initialize protocols
(defun initialize-protocols ()
  (setf (gethash "fire-ignition" *protocols*)
        (make-protocol
         :name "Fire Ignition"
         :intention "Activate creative fire and passion"
         :duration "15 minutes"
         :steps '("Deep breathing with visualization"
                  "Creative energy movement"
                  "Intention setting"
                  "Sacred flame meditation")))

  (setf (gethash "water-flow" *protocols*)
        (make-protocol
         :name "Water Flow"
         :intention "Emotional healing and intuitive flow"
         :duration "20 minutes"
         :steps '("Emotional body scan"
                  "Water visualization"
                  "Healing intention"
                  "Intuitive guidance reception")))

  (setf (gethash "earth-grounding" *protocols*)
        (make-protocol
         :name "Earth Grounding"
         :intention "Physical embodiment and stability"
         :duration "10 minutes"
         :steps '("Body awareness"
                  "Root chakra activation"
                  "Earth connection"
                  "Stability affirmation"))))

;;; Consciousness analysis functions
(defun analyze-consciousness-state (user-message &optional user-context)
  "Main consciousness analysis function"
  (let* ((elemental-balance (detect-elemental-balance user-message))
         (archetypal-state (detect-archetypal-state user-message elemental-balance))
         (spiral-phase (detect-spiral-phase user-message elemental-balance))
         (patterns (identify-consciousness-patterns user-message))
         (recommendations (generate-recommendations patterns elemental-balance archetypal-state)))

    (make-consciousness-analysis
     :patterns patterns
     :elemental-balance elemental-balance
     :archetypal-state archetypal-state
     :spiral-phase spiral-phase
     :recommendations recommendations
     :timestamp (get-universal-time))))

(defun detect-elemental-balance (message)
  "Detect elemental balance from consciousness patterns in message"
  (let ((fire-keywords '("passion" "creative" "energy" "drive" "motivation" "inspiration"))
        (water-keywords '("emotion" "feeling" "flow" "intuitive" "healing" "sensitive"))
        (earth-keywords '("grounded" "practical" "stable" "embodied" "physical" "material"))
        (air-keywords '("thought" "clarity" "communication" "mental" "ideas" "intellectual"))
        (aether-keywords '("spiritual" "transcendent" "unity" "divine" "sacred" "mystical")))

    (flet ((count-keywords (keywords)
             (/ (loop for keyword in keywords
                      sum (if (search keyword (string-downcase message)) 1 0))
                (length keywords))))

      (list :fire (min 1.0 (+ 0.3 (* 0.7 (count-keywords fire-keywords))))
            :water (min 1.0 (+ 0.3 (* 0.7 (count-keywords water-keywords))))
            :earth (min 1.0 (+ 0.3 (* 0.7 (count-keywords earth-keywords))))
            :air (min 1.0 (+ 0.3 (* 0.7 (count-keywords air-keywords))))
            :aether (min 1.0 (+ 0.3 (* 0.7 (count-keywords aether-keywords))))))))

(defun detect-archetypal-state (message elemental-balance)
  "Detect dominant archetypal lens"
  (let* ((fire-level (getf elemental-balance :fire))
         (water-level (getf elemental-balance :water))
         (earth-level (getf elemental-balance :earth))
         (air-level (getf elemental-balance :air))
         (aether-level (getf elemental-balance :aether))

         (mystic-score (+ (* aether-level 0.4) (* water-level 0.3) (* air-level 0.3)))
         (healer-score (+ (* water-level 0.4) (* earth-level 0.3) (* aether-level 0.3)))
         (creator-score (+ (* fire-level 0.4) (* air-level 0.3) (* earth-level 0.3)))
         (sage-score (+ (* air-level 0.4) (* aether-level 0.3) (* earth-level 0.3)))
         (seeker-score (+ (* fire-level 0.3) (* water-level 0.2) (* air-level 0.2) (* aether-level 0.3))))

    (let ((max-score (max mystic-score healer-score creator-score sage-score seeker-score)))
      (cond
        ((= max-score mystic-score) (list :dominant "mystic" :integration-level mystic-score))
        ((= max-score healer-score) (list :dominant "healer" :integration-level healer-score))
        ((= max-score creator-score) (list :dominant "creator" :integration-level creator-score))
        ((= max-score sage-score) (list :dominant "sage" :integration-level sage-score))
        ((= max-score seeker-score) (list :dominant "seeker" :integration-level seeker-score))
        (t (list :dominant "balanced" :integration-level 0.5))))))

(defun detect-spiral-phase (message elemental-balance)
  "Detect current spiral phase based on consciousness patterns"
  (let ((challenge-keywords '("problem" "difficulty" "struggle" "stuck" "confused" "overwhelmed"))
        (descent-keywords '("deep" "inner" "shadow" "healing" "processing" "integration"))
        (emergence-keywords '("breakthrough" "clarity" "insight" "understanding" "growth"))
        (integration-keywords '("balance" "harmony" "wisdom" "mastery" "embodiment")))

    (flet ((keyword-match-count (keywords)
             (loop for keyword in keywords
                   sum (if (search keyword (string-downcase message)) 1 0))))

      (let ((challenge-count (keyword-match-count challenge-keywords))
            (descent-count (keyword-match-count descent-keywords))
            (emergence-count (keyword-match-count emergence-keywords))
            (integration-count (keyword-match-count integration-keywords)))

        (cond
          ((> challenge-count 0) (list :phase "call" :intensity (min 1.0 (/ challenge-count 3))))
          ((> descent-count 0) (list :phase "descent" :intensity (min 1.0 (/ descent-count 3))))
          ((> emergence-count 0) (list :phase "emergence" :intensity (min 1.0 (/ emergence-count 3))))
          ((> integration-count 0) (list :phase "integration" :intensity (min 1.0 (/ integration-count 3))))
          (t (list :phase "call" :intensity 0.3)))))))

(defun identify-consciousness-patterns (message)
  "Identify consciousness development patterns"
  (let ((patterns '()))
    (when (search "consciousness" (string-downcase message))
      (push "consciousness-exploration-active" patterns))
    (when (search "spiritual" (string-downcase message))
      (push "spiritual-development-focus" patterns))
    (when (search "growth" (string-downcase message))
      (push "personal-growth-orientation" patterns))
    (when (search "wisdom" (string-downcase message))
      (push "wisdom-seeking-behavior" patterns))

    (or patterns (list "baseline-consciousness-state"))))

(defun generate-recommendations (patterns elemental-balance archetypal-state)
  "Generate consciousness development recommendations"
  (let ((recommendations '())
        (dominant-element (find-dominant-element elemental-balance))
        (archetype (getf archetypal-state :dominant)))

    ;; Element-based recommendations
    (case dominant-element
      (:fire (push "Engage creative practices and passion projects" recommendations))
      (:water (push "Focus on emotional healing and intuitive development" recommendations))
      (:earth (push "Ground energy through physical practices and embodiment" recommendations))
      (:air (push "Cultivate mental clarity and communication skills" recommendations))
      (:aether (push "Deepen spiritual practice and sacred connection" recommendations)))

    ;; Archetype-based recommendations
    (cond
      ((string= archetype "mystic")
       (push "Meditation and contemplative practices" recommendations))
      ((string= archetype "healer")
       (push "Energy healing and emotional support practices" recommendations))
      ((string= archetype "creator")
       (push "Creative expression and manifestation work" recommendations))
      ((string= archetype "sage")
       (push "Study wisdom teachings and share knowledge" recommendations))
      ((string= archetype "seeker")
       (push "Exploration and adventure-based growth" recommendations)))

    recommendations))

(defun find-dominant-element (elemental-balance)
  "Find the dominant element from balance analysis"
  (let ((max-element nil)
        (max-value 0))

    (loop for (element value) on elemental-balance by #'cddr do
      (when (> value max-value)
        (setf max-value value
              max-element element)))

    max-element))

;;; Spiralogic reading functions
(defun perform-spiralogic-reading (user-id question)
  "Perform a Spiralogic consciousness reading"
  (let* ((hexagram (1+ (random 64)))
         (facets '(:fire-visibility :earth-grounding :water-depth :air-expansion :aether-transcendence))
         (facet (nth (random (length facets)) facets))
         (interpretation (format nil "Hexagram ~A guides you to explore ~A in response to: ~A"
                                hexagram facet question))
         (protocols (recommend-protocols-for-facet facet)))

    (make-spiralogic-reading
     :hexagram hexagram
     :facet facet
     :interpretation interpretation
     :protocols protocols
     :timestamp (get-universal-time))))

(defun recommend-protocols-for-facet (facet)
  "Recommend consciousness protocols based on facet"
  (case facet
    (:fire-visibility (list "fire-ignition"))
    (:earth-grounding (list "earth-grounding"))
    (:water-depth (list "water-flow"))
    (:air-expansion (list "air-clarity"))
    (:aether-transcendence (list "aether-unity"))
    (t (list "earth-grounding"))))

;;; HTTP endpoint handlers

(define-easy-handler (health :uri "/health") ()
  (setf (content-type*) "application/json")
  (encode-json-to-string
   '(("service" . "Navigator HTTP Server")
     ("status" . "operational")
     ("version" . "1.0.0")
     ("consciousness_computing" . "active")
     ("timestamp" . ,(get-universal-time)))))

(define-easy-handler (analyze-consciousness :uri "/api/navigator/analyze") (message user-id)
  (setf (content-type*) "application/json")
  (handler-case
      (let ((analysis (analyze-consciousness-state (or message "baseline consciousness check"))))
        (encode-json-to-string
         `(("success" . t)
           ("analysis" . (("patterns" . ,(consciousness-analysis-patterns analysis))
                          ("elemental_balance" . ,(plist-alist (consciousness-analysis-elemental-balance analysis)))
                          ("archetypal_state" . ,(plist-alist (consciousness-analysis-archetypal-state analysis)))
                          ("spiral_phase" . ,(plist-alist (consciousness-analysis-spiral-phase analysis)))
                          ("recommendations" . ,(consciousness-analysis-recommendations analysis))
                          ("timestamp" . ,(consciousness-analysis-timestamp analysis))))
           ("user_id" . ,(or user-id "anonymous")))))
    (error (e)
      (encode-json-to-string
       `(("success" . nil)
         ("error" . ,(format nil "Analysis error: ~A" e))
         ("timestamp" . ,(get-universal-time)))))))

(define-easy-handler (spiralogic-reading :uri "/api/navigator/spiralogic") (user-id question)
  (setf (content-type*) "application/json")
  (handler-case
      (let ((reading (perform-spiralogic-reading (or user-id "anonymous")
                                               (or question "What guidance do I need?"))))
        (encode-json-to-string
         `(("success" . t)
           ("reading" . (("hexagram" . ,(spiralogic-reading-hexagram reading))
                         ("facet" . ,(string (spiralogic-reading-facet reading)))
                         ("interpretation" . ,(spiralogic-reading-interpretation reading))
                         ("protocols" . ,(spiralogic-reading-protocols reading))
                         ("timestamp" . ,(spiralogic-reading-timestamp reading))))
           ("user_id" . ,(or user-id "anonymous")))))
    (error (e)
      (encode-json-to-string
       `(("success" . nil)
         ("error" . ,(format nil "Reading error: ~A" e))
         ("timestamp" . ,(get-universal-time)))))))

(define-easy-handler (get-protocol :uri "/api/navigator/protocol") (name)
  (setf (content-type*) "application/json")
  (let ((protocol (gethash name *protocols*)))
    (if protocol
        (encode-json-to-string
         `(("success" . t)
           ("protocol" . (("name" . ,(protocol-name protocol))
                          ("intention" . ,(protocol-intention protocol))
                          ("duration" . ,(protocol-duration protocol))
                          ("steps" . ,(protocol-steps protocol))))))
        (encode-json-to-string
         `(("success" . nil)
           ("error" . ,(format nil "Protocol '~A' not found" name)))))))

;;; Utility functions
(defun plist-alist (plist)
  "Convert plist to alist for JSON encoding"
  (loop for (key value) on plist by #'cddr
        collect (cons (string-downcase (string key)) value)))

;;; Server management functions
(defun start-navigator-server (&optional (port 7777))
  "Start the Navigator HTTP server"
  (when *server*
    (stop *server*))

  (initialize-protocols)

  (setf *server* (start (make-instance 'easy-acceptor :port port)))

  (format t "🧠🌐 Navigator HTTP Server started on port ~A~%" port)
  (format t "📊 Health check: http://localhost:~A/health~%" port)
  (format t "🧠 Analysis endpoint: http://localhost:~A/api/navigator/analyze~%" port)
  (format t "🔮 Spiralogic endpoint: http://localhost:~A/api/navigator/spiralogic~%" port)

  *server*)

(defun stop-navigator-server ()
  "Stop the Navigator HTTP server"
  (when *server*
    (stop *server*)
    (setf *server* nil)
    (format t "🧠🛑 Navigator HTTP Server stopped~%")))

;;; Auto-start server
(start-navigator-server)