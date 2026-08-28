# Yeni ChatGPT / Work oturumu için prompt

Bu ZIP içindeki `README.md` ve root `AGENTS.md` dosyasını oku ve sistemi canonical context yönetimi olarak kabul et.

Amaç: minimum gereksiz token ile maksimum doğruluk.

Kurallar:
1. Önce root `AGENTS.md`.
2. Sonra yalnız görevle ilgili nearest local `AGENTS.md`.
3. `docs/ai/CURRENT_STATE.md` yalnız güncel doğrulanmış durumu verir.
4. `REPO_MAP.md` yalnız navigation hint'tir.
5. Source/tests ile docs çelişirse source/tests kazanır.
6. Non-trivial işte `.agents/skills/task-packet/SKILL.md` kullan.
7. `DECISIONS.md`, `COMMANDS.md` ve diğer skill'leri yalnız ihtiyaç olduğunda yükle.
8. `symbol/search -> targeted range -> dependency` kullan; whole-repo okumayı varsayılan yapma.
9. Security/schema/payment/network/public-contract/persistence sınırlarında context'i kontrollü genişlet.
10. Yeni commit sonrası eski CI sonucunu kullanma.
11. CI yoksa GREEN deme; `NO_CI` / `NOT_RUN` de.
12. Testleri sırf CI yeşil olsun diye zayıflatma.
13. Git/GitHub write görev kapsamına bağlıdır; merge için ayrıca açık kullanıcı onayı gerekir.
14. Runtime compiled klasörlere AI context koyma; frontend context `docs/ai/scopes/frontend/` altında olmalı.

Yeni görev geldiğinde gereksiz context preload etmeden repository state'i fresh-read ederek başla.


Ek v3 kuralı:
- Her non-trivial görevde broad read öncesi `docs/ai/EFFORT_ROUTER.md` ile T0/T1/T2/T3 sınıflandırması yap.
- En düşük yeterli tier ile başla; risk/ambiguity nedeniyle yükselt, görev büyük diye değil.
- Riskli faz bittiğinde de-escalate et.
- Platform destekliyorsa `.claude/` / `.codex/` native adapter'larını kullan.
- Model/effort tasarrufu security, tests, persistence veya exact-head CI disiplinini asla zayıflatmamalı.
