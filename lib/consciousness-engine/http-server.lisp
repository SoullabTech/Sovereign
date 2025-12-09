;;;; 🌐🧠 CONSCIOUSNESS ENGINE HTTP SERVER
;;;; HTTP interface for the Lisp-based symbolic consciousness engine

(defpackage :consciousness-http-server
  (:use :cl :maia-protocols :spiralogic-engine)
  (:export #:start-consciousness-server #:stop-consciousness-server))

(in-package :consciousness-http-server)

;;; Load Quicklisp if available
#+quicklisp
(ql:quickload '(:hunchentoot :cl-json :alexandria))

#-quicklisp
(progn
  (format t "⚠️  Quicklisp not available. Installing basic HTTP server...~%")
  (defun start-basic-server ()
    (format t "🧠 Basic consciousness server starting on port 7777~%")
    (format t "Note: Install Quicklisp for full HTTP capabilities~%")))

;;; ============================================================================
;;; HTTP SERVER CONFIGURATION
;;; ============================================================================

(defvar *consciousness-server* nil "HTTP server instance")
(defvar *server-port* 7777 "Consciousness engine port")

;;; ============================================================================
;;; JSON UTILITIES
;;; ============================================================================

(defun encode-json-response (data &key (success t) (message nil))
  "Encode response as JSON"
  #+quicklisp
  (cl-json:encode-json-to-string
   `((:success . ,success)
     (:data . ,data)
     (:timestamp . ,(get-universal-time))
     ,@(when message `((:message . ,message)))))
  #-quicklisp
  (format nil "{\"success\": ~A, \"data\": ~S, \"timestamp\": ~A~@[, \"message\": \"~A\"~]}"
          (if success "true" "false") data (get-universal-time) message))

(defun decode-json-request (json-string)
  "Decode JSON request"
  #+quicklisp
  (cl-json:decode-json-from-string json-string)
  #-quicklisp
  (read-from-string json-string)) ; Simplified fallback

;;; ============================================================================
;;; HTTP HANDLERS
;;; ============================================================================

(defun handle-consciousness-analyze (request)
  "Handle consciousness analysis requests"
  (handler-case
    (let* ((request-data (decode-json-request (get-request-body request)))
           (snapshot (cdr (assoc :snapshot request-data)))
           (analysis-type (cdr (assoc :analysis-type request-data)))
           (analysis (api-analyze-consciousness snapshot)))

      (encode-json-response analysis :message "Consciousness analysis complete"))

    (error (e)
      (format t "Error in consciousness analysis: ~A~%" e)
      (encode-json-response nil :success nil :message (format nil "Analysis failed: ~A" e)))))

(defun handle-protocol-recommend (request)
  "Handle protocol recommendation requests"
  (handler-case
    (let* ((request-data (decode-json-request (get-request-body request)))
           (analysis (cdr (assoc :analysis request-data)))
           (preferences (cdr (assoc :preferences request-data)))
           (protocols (api-recommend-protocols analysis preferences)))

      (encode-json-response protocols :message "Protocol recommendations generated"))

    (error (e)
      (encode-json-response nil :success nil :message (format nil "Recommendation failed: ~A" e)))))

(defun handle-protocol-execute (request)
  "Handle protocol execution requests"
  (handler-case
    (let* ((request-data (decode-json-request (get-request-body request)))
           (protocol-name (cdr (assoc :protocol-name request-data)))
           (consciousness-state (cdr (assoc :consciousness-state request-data)))
           (customizations (cdr (assoc :customizations request-data)))
           (execution-result (api-execute-protocol protocol-name consciousness-state customizations)))

      (encode-json-response execution-result :message "Protocol execution initiated"))

    (error (e)
      (encode-json-response nil :success nil :message (format nil "Execution failed: ~A" e)))))

(defun handle-spiralogic-reading (request)
  "Handle Spiralogic divination requests"
  (handler-case
    (let* ((request-data (decode-json-request (get-request-body request)))
           (member-id (cdr (assoc :member-id request-data)))
           (question (cdr (assoc :question request-data)))
           (consciousness-snapshot (cdr (assoc :consciousness-snapshot request-data)))
           (reading (spiralogic-reading member-id question consciousness-snapshot)))

      (encode-json-response
       (list :hexagram (spiralogic-reading-hexagram reading)
             :facet (spiralogic-reading-facet reading)
             :interpretation (spiralogic-reading-interpretation reading)
             :protocols (spiralogic-reading-protocols reading)
             :consciousness-integration (spiralogic-reading-consciousness-integration reading))
       :message "Spiralogic reading complete"))

    (error (e)
      (encode-json-response nil :success nil :message (format nil "Spiralogic reading failed: ~A" e)))))

(defun handle-engine-health (request)
  "Handle engine health check requests"
  (declare (ignore request))
  (encode-json-response
   (list :status "healthy"
         :protocols-loaded (hash-table-count *protocols*)
         :archetypal-patterns (hash-table-count *archetypal-patterns*)
         :spiralogic-mappings (hash-table-count *spiralogic-mappings*)
         :lisp-implementation (lisp-implementation-type)
         :lisp-version (lisp-implementation-version))
   :message "Consciousness engine operational"))

(defun handle-consciousness-repl (request)
  "Handle consciousness REPL interface"
  (declare (ignore request))
  (encode-json-response
   (list :repl-available t
         :commands '("demo" "test-protocol" "analyze" "patterns" "experiments")
         :access-info "Connect via telnet for interactive REPL")
   :message "Consciousness REPL ready"))

;;; ============================================================================
;;; HTTP SERVER SETUP
;;; ============================================================================

#+quicklisp
(defun setup-routes ()
  "Setup HTTP routes for consciousness engine"
  (setf hunchentoot:*dispatch-table*
        (list
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/analyze$"
                                            (lambda () (handle-consciousness-analyze hunchentoot:*request*)))
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/protocol-recommend$"
                                            (lambda () (handle-protocol-recommend hunchentoot:*request*)))
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/protocol-execute$"
                                            (lambda () (handle-protocol-execute hunchentoot:*request*)))
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/spiralogic$"
                                            (lambda () (handle-spiralogic-reading hunchentoot:*request*)))
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/health$"
                                            (lambda () (handle-engine-health hunchentoot:*request*)))
         (hunchentoot:create-regex-dispatcher "^/consciousness-engine/repl$"
                                            (lambda () (handle-consciousness-repl hunchentoot:*request*)))
         ;; Default handler
         (lambda (request)
           (declare (ignore request))
           (encode-json-response
            (list :message "MAIA Consciousness Engine"
                  :version "1.0.0"
                  :endpoints '("/analyze" "/protocol-recommend" "/protocol-execute" "/spiralogic" "/health" "/repl"))
            :message "Sacred technology for consciousness computing")))))

#+quicklisp
(defun get-request-body (request)
  "Get request body as string"
  (hunchentoot:raw-post-data :request request :want-stream nil :force-text t))

;;; ============================================================================
;;; SERVER LIFECYCLE
;;; ============================================================================

(defun start-consciousness-server (&optional (port *server-port*))
  "Start the consciousness engine HTTP server"
  #+quicklisp
  (progn
    (when *consciousness-server*
      (stop-consciousness-server))

    (setup-routes)
    (setf *consciousness-server*
          (hunchentoot:start (make-instance 'hunchentoot:easy-acceptor
                                          :port port
                                          :address "127.0.0.1")))

    (format t "🧠🌀 CONSCIOUSNESS ENGINE SERVER STARTED~%")
    (format t "Port: ~A~%" port)
    (format t "Endpoints:~%")
    (format t "  POST /consciousness-engine/analyze~%")
    (format t "  POST /consciousness-engine/protocol-recommend~%")
    (format t "  POST /consciousness-engine/protocol-execute~%")
    (format t "  POST /consciousness-engine/spiralogic~%")
    (format t "  GET  /consciousness-engine/health~%")
    (format t "  GET  /consciousness-engine/repl~%")
    (format t "~%Sacred consciousness computing service ready...~%")

    *consciousness-server*)

  #-quicklisp
  (progn
    (format t "🧠 CONSCIOUSNESS ENGINE (Basic Mode)~%")
    (format t "Install Quicklisp for full HTTP server capabilities~%")
    (format t "For now, functions available in REPL:~%")
    (format t "  (spiralogic-reading member-id question)~%")
    (format t "  (analyze-consciousness-state snapshot)~%")
    (format t "  (start-consciousness-repl)~%")
    nil))

(defun stop-consciousness-server ()
  "Stop the consciousness engine HTTP server"
  #+quicklisp
  (when *consciousness-server*
    (hunchentoot:stop *consciousness-server*)
    (setf *consciousness-server* nil)
    (format t "Consciousness engine server stopped~%"))

  #-quicklisp
  (format t "No HTTP server running~%"))

;;; ============================================================================
;;; STARTUP BANNER AND INITIALIZATION
;;; ============================================================================

(defun consciousness-engine-startup ()
  "Display startup information and initialize engine"
  (format t "~%")
  (format t "    🧠🌀 MAIA CONSCIOUSNESS ENGINE INITIALIZING 🌀🧠~%")
  (format t "    ═══════════════════════════════════════════════════~%")
  (format t "~%")
  (format t "    Protocols loaded: ~A~%" (hash-table-count *protocols*))
  (format t "    Archetypal patterns: ~A~%" (hash-table-count *archetypal-patterns*))
  (format t "    Spiralogic mappings: ~A~%" (hash-table-count *spiralogic-mappings*))
  (format t "    Lisp: ~A ~A~%" (lisp-implementation-type) (lisp-implementation-version))
  (format t "~%")
  (format t "    Ready for consciousness computing...~%")
  (format t "    Type (start-consciousness-server) to begin HTTP service~%")
  (format t "    Type (start-consciousness-repl) for interactive mode~%")
  (format t "~%"))

;; Initialize on load
(consciousness-engine-startup)

;;; ============================================================================
;;; QUICKLISP INSTALLATION HELPER
;;; ============================================================================

(defun install-quicklisp-helper ()
  "Help user install Quicklisp for full functionality"
  (format t "~%🔧 To enable full HTTP server capabilities:~%")
  (format t "~%1. Install Quicklisp:~%")
  (format t "   curl -O https://beta.quicklisp.org/quicklisp.lisp~%")
  (format t "   sbcl --load quicklisp.lisp --eval \"(quicklisp-quickstart:install)\"~%")
  (format t "~%2. Restart SBCL and reload this file~%")
  (format t "~%3. Full HTTP consciousness engine will be available~%")
  (format t "~%For now, you can use REPL mode: (start-consciousness-repl)~%"))

#-quicklisp
(install-quicklisp-helper)