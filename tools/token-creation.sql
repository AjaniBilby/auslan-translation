INSERT INTO "TokenSet" (name) VALUES ('auslan_v1') RETURNING "id";
WITH ordered_signs AS (
  SELECT ROW_NUMBER() OVER (ORDER BY "id" ASC) + 4 as "tokenID", "id" as "signID"
  FROM "public"."_SignToVocab"
  INNER JOIN "public"."Sign" ON "A" = "id"
  WHERE "B" = 1 AND "isActive" = true
)
INSERT INTO "TokenMapping" ("setID", "tokenID", "signID")
SELECT '1', "tokenID", "signID" FROM ordered_signs;