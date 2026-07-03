import math
import os
import struct
import wave

from controller.utils import ensure_ffmpeg_available, transcribe_audio

sample = "test-tone.wav"
with wave.open(sample, "w") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(16000)
    for i in range(16000):
        value = int(32767 * 0.2 * math.sin(2 * math.pi * 440 * i / 16000))
        wf.writeframesraw(struct.pack("<h", value))

print("sample=", os.path.abspath(sample))
print("ffmpeg=", ensure_ffmpeg_available())
print("transcript=", repr(transcribe_audio(sample)))
