#!/usr/bin/env python3
"""TURN-03 A3 Smart Turn v3.2 comparator. Local-only, stateless, shadow-only."""
from __future__ import annotations
import argparse, base64, hashlib, json, math, sys
from pathlib import Path
import numpy as np
import onnxruntime as ort
from transformers import WhisperFeatureExtractor

PROTOCOL='maia.turn-smart-comparator.v1'
MODEL_ID='pipecat-ai/smart-turn-v3'
SAMPLE_RATE=16000
MAX_SAMPLES=8*SAMPLE_RATE
THRESHOLD=0.5
LICENSE='BSD-2-Clause'

def sha256(path: Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()

def build_session(path: Path):
    # Pinned upstream inference.py contract: sequential, 1 inter-op thread, ORT optimizations.
    so=ort.SessionOptions(); so.execution_mode=ort.ExecutionMode.ORT_SEQUENTIAL; so.inter_op_num_threads=1
    so.graph_optimization_level=ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    return ort.InferenceSession(str(path),sess_options=so,providers=['CPUExecutionProvider'])

def decode(message: dict)->np.ndarray:
    seq=message.get('seq'); at_ms=message.get('atMs')
    if not isinstance(seq,int) or seq<0 or not isinstance(at_ms,(int,float)) or not math.isfinite(at_ms): raise ValueError('invalid audio metadata')
    raw=base64.b64decode(message.get('pcm16leBase64',''),validate=True)
    if not raw or len(raw)%2: raise ValueError('PCM16LE byte length must be positive and even')
    pcm=np.frombuffer(raw,dtype='<i2').astype(np.float32)/32768.0
    return pcm

def prepare(audio: np.ndarray, fe: WhisperFeatureExtractor)->np.ndarray:
    # Exact upstream audio_utils.py behavior: keep last 8 s, otherwise LEFT-pad.
    if len(audio)>MAX_SAMPLES: audio=audio[-MAX_SAMPLES:]
    elif len(audio)<MAX_SAMPLES: audio=np.pad(audio,(MAX_SAMPLES-len(audio),0),mode='constant',constant_values=0)
    inputs=fe(audio,sampling_rate=SAMPLE_RATE,return_tensors='np',padding='max_length',max_length=MAX_SAMPLES,truncation=True,do_normalize=True)
    x=inputs.input_features.squeeze(0).astype(np.float32)
    return np.expand_dims(x,axis=0)

def emit(obj: dict)->None:
    sys.stdout.write(json.dumps(obj,separators=(',',':'))+'\n'); sys.stdout.flush()

def main()->int:
    ap=argparse.ArgumentParser(); ap.add_argument('--model-path',required=True); ap.add_argument('--expected-sha256',required=True); ap.add_argument('--model-version',required=True)
    args=ap.parse_args(); path=Path(args.model_path).expanduser().resolve()
    if not path.is_file(): raise SystemExit('model path must be local file')
    actual=sha256(path); expected=args.expected_sha256.lower().strip()
    if len(expected)!=64 or actual!=expected: raise SystemExit(f'model SHA-256 mismatch: expected={expected} actual={actual}')
    fe=WhisperFeatureExtractor(chunk_length=8); sess=build_session(path)
    inputs=sess.get_inputs(); outputs=sess.get_outputs()
    if len(inputs)!=1 or inputs[0].name!='input_features' or list(inputs[0].shape[1:])!=[80,800]: raise SystemExit('unexpected Smart Turn input contract')
    emit({'type':'hello','protocol':PROTOCOL,'sampleRateHz':SAMPLE_RATE,'channels':1,'maxTurnSamples':MAX_SAMPLES,'threshold':THRESHOLD,'model':{'provider':'smart-turn','modelId':MODEL_ID,'modelVersion':args.model_version,'weightLicense':LICENSE,'sha256':actual}})
    for line in sys.stdin:
        if not line.strip(): continue
        seq=None
        try:
            m=json.loads(line); seq=m.get('seq')
            if m.get('type')!='audio': raise ValueError('unsupported message type')
            audio=decode(m); x=prepare(audio,fe); out=sess.run(None,{'input_features':x})
            prob=float(np.asarray(out[0]).reshape(-1)[0])
            if not math.isfinite(prob) or prob<0 or prob>1: raise ValueError('invalid completion probability')
            emit({'type':'prediction','seq':seq,'atMs':m['atMs'],'completeProbability':prob,'complete':prob>THRESHOLD})
        except Exception as exc:
            emit({'type':'error','code':str(exc),**({'seq':seq} if isinstance(seq,int) else {})})
    return 0
if __name__=='__main__': raise SystemExit(main())
