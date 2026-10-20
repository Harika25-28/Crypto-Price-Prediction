import requests

coins = ['ethereum', 'solana', 'cardano', 'binancecoin']

for coin in coins:
    print(f"\nTraining {coin}...", flush=True)
    try:
        r = requests.post(f'http://localhost:8000/api/train/{coin}/', timeout=600)
        data = r.json()
        if 'models' in data:
            for m, v in data['models'].items():
                print(f"  {m}: f1={v['f1_score']:.2%}  mape={v['mape']:.2f}%")
        else:
            print(f"  Response: {data}")
    except Exception as e:
        print(f"  Failed: {e}")

print("\nAll coins trained!")
