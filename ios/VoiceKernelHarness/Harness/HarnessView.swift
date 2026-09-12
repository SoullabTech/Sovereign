// KERNEL-00 · harness view. Renders only what the kernel says is true.
import SwiftUI
import VoiceKernel

struct HarnessView: View {
    @StateObject private var m = HarnessModel()

    var body: some View {
        NavigationStack {
            List {
                stateSection
                healthSection
                routeSection
                outputSection
                faultsSection
                witnessSection
            }
            .navigationTitle("VoiceKernel · K00")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Export journal") { m.exportJournal() }
                }
            }
            .sheet(item: Binding(get: { m.exportURL.map(ExportItem.init) }, set: { _ in })) { item in
                ShareSheet(items: [item.url])
            }
        }
    }

    private var s: KernelSnapshot { m.snapshot }

    // MARK: sections

    private var stateSection: some View {
        Section("Floor · generation \(s.generation)") {
            HStack {
                Text(s.floor.rawValue).font(.title2.bold())
                Spacer()
                Text(s.displaysListening ? "listening (input healthy)" : (s.floor == .listening ? "floor listening · input \(s.inputFlow.rawValue)" : ""))
                    .font(.caption).foregroundStyle(.secondary)
            }
            if let c = s.lastCause { Text("cause: \(c)").font(.caption.monospaced()).foregroundStyle(.secondary) }
            HStack {
                Button(s.floor == .idle ? "Enter conversation" : "Leave") {
                    if s.floor == .idle { m.enter() } else { m.leave() }
                }
                .buttonStyle(.borderedProminent)
                if s.floor == .degraded {
                    Button("Re-enter (member act)") { m.reenter() }.buttonStyle(.bordered)
                }
            }
            if let d = s.recovery.degradedCause {
                Text("DEGRADED — \(d) · attempts \(s.recovery.attemptsInWindow)/\(s.recovery.budget). Text channel would remain available.")
                    .foregroundStyle(.red)
            }
            // PRE-WITNESS-03 C — the causal discriminator, set BEFORE Enter only.
            // Projection of the kernel's setting; the kernel refuses and journals a
            // change attempted in conversation, and the button is inert then too.
            Button(s.voiceProcessingEnabled ? "Voice processing: ON (default)" : "Voice processing: OFF (control run)") {
                m.toggleVoiceProcessing()
            }
            .buttonStyle(.bordered)
            .disabled(s.floor != .idle)
        }
    }

    private var healthSection: some View {
        Section("Physical health (observed)") {
            row("session", s.audioSession.rawValue)
            row("inputFlow", s.inputFlow.rawValue, tint: s.inputFlow == .healthy ? .green : (s.inputFlow == .dead ? .red : .orange))
            row("outputFlow", s.outputFlow.rawValue)
            row("input rms / peak", String(format: "%.5f / %.5f", s.lastInputRms, s.lastInputPeak))
            row("callbacks (gen)", "\(s.inputCallbacksInGeneration)")
            row("recovery", "gen \(s.recovery.generation) · attempts \(s.recovery.attemptsInWindow)/\(s.recovery.budget)\(s.recovery.lastFaultClass.map { " · \($0)" } ?? "")")
            HStack {
                Button(s.micEnabled ? "Mic: enabled" : "Mic: disabled") { m.toggleMic() }
                Button(s.outputEnabled ? "Output: enabled" : "Output: disabled") { m.toggleOutput() }
            }.buttonStyle(.bordered)
        }
    }

    private var routeSection: some View {
        Section("Route (K00-11) — authority-owned override") {
            row("route", "\(s.route.output) ← \(s.route.input)\(s.route.inputDataSource.map { " (\($0))" } ?? "")")
            row("sr / io", "\(Int(s.route.sampleRate ?? 0)) Hz · \(String(format: "%.2f", s.route.ioBufferDurationMs ?? 0)) ms")
            row("override", s.outputOverrideSpeaker ? "speaker" : "system default")
            HStack {
                Button("Speaker") { m.routeToSpeaker() }
                Button("System default") { m.routeToSystemDefault() }
            }.buttonStyle(.bordered).disabled(s.floor == .idle)
            Text("Bluetooth: connect/disconnect the device itself; each admitted transition must recover with no manual tap.")
                .font(.caption).foregroundStyle(.secondary)
        }
    }

    private var outputSection: some View {
        Section("Output streams (every stream has an identity)") {
            HStack {
                Button("Play 3 s tone") { m.playTone() }.buttonStyle(.borderedProminent)
                    .disabled(s.floor != .listening || !s.outputEnabled)
                Button("Cancel active") { m.cancelActive() }.buttonStyle(.bordered)
                    .disabled(!s.streams.contains { $0.state == .rendering })
            }
            if let c = s.lastCancelToSilenceMs {
                row("last cancel → silence", "\(c) ms", tint: c <= 100 ? .green : .red)
            }
            ForEach(s.streams.suffix(5).reversed(), id: \.id) { st in
                HStack {
                    Text(String(st.id.raw.prefix(8))).font(.caption.monospaced())
                    Text(st.state.rawValue)
                    Spacer()
                    Text("\(st.framesRendered)/\(st.framesScheduled)").font(.caption.monospaced())
                }
            }
        }
    }

    private var faultsSection: some View {
        Section("Fault injection (K00 §4) — synthetic, labelled in the journal") {
            Toggle("Digital-zero input (K00-07)", isOn: $m.faults.digitalZeroInput)
            Toggle("Stall output progress at the observation seam (K00-08)", isOn: $m.faults.stallOutput)
            Toggle("Hold one callback, fire after recovery (K00-09)", isOn: $m.faults.holdStaleCallback)
            Toggle("Persistent fault (K00-10)", isOn: $m.faults.persistentFault)
            Button("Apply faults") { m.applyFaults() }.buttonStyle(.bordered)
        }
    }

    private var witnessSection: some View {
        Section("Witness bookkeeping (K00-15)") {
            row("elapsed", String(format: "%.1f min", m.elapsedMinutes))
            row("cycles complete", "\(m.cyclesCompleted)")
            row("route changes", "\(m.routeChanges)")
            row("interruptions", "\(m.interruptions)")
            row("media resets", "\(m.resets)")
            row("manual interventions", "\(s.manualInterventions)", tint: s.manualInterventions == 0 ? .green : .red)
            row("journal events", "\(s.journalCount)")
            if let r = m.replayReport {
                row("replay", r.passes ? "PASS · \(r.transitions) transitions · \(r.staleCallbacksDropped) stale dropped · gens \(r.generationsSeen.sorted())" : "FAIL · \(r.orphanTransitions.count) orphans · \(r.unattributedActs.count) unattributed · \(r.brokenCausality.count) broken causality",
                    tint: r.passes ? .green : .red)
            }
            Button("Record manual intervention (honesty)") { m.manualIntervention() }
                .buttonStyle(.bordered).tint(.red)
        }
    }

    private func row(_ k: String, _ v: String, tint: Color = .primary) -> some View {
        HStack {
            Text(k).foregroundStyle(.secondary)
            Spacer()
            Text(v).font(.callout.monospaced()).foregroundStyle(tint).multilineTextAlignment(.trailing)
        }
    }
}

private struct ExportItem: Identifiable {
    let url: URL
    var id: String { url.absoluteString }
}

/// Local share sheet so the JSONL can be AirDropped/saved to Files. No network is initiated by the app.
private struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ vc: UIActivityViewController, context: Context) {}
}
