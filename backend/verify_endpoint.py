import urllib.request
import json

payload = {
    "notes": "Cellular respiration converts glucose into ATP. Glycolysis occurs in the cytoplasm and is anaerobic. The citric acid cycle occurs in the mitochondria.",
    "difficulty": "medium",
    "question_count": 10,
}

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/v1/questions/generate",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer dev_user_test",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
        print(f"SUCCESS: Status {res.status}")
        print(f"Generated {len(data['questions'])} questions:")
        for idx, q in enumerate(data['questions'][:3]):
            print(f"  {idx+1}. [{q['type']}] {q['question']}")
except Exception as e:
    print(f"ERROR: {e}")
