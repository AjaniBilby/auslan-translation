SELECT LOWER("text") as "text", "tokenID"
FROM "public"."TokenMapping"
INNER JOIN "SignKeyword" ON "SignKeyword"."signID" = "TokenMapping"."signID"
INNER JOIN "Keyword" ON "keywordID" = "Keyword"."id"
Where "type" = 'SYNONYM' and "setID" = '1'

UNION ALL

SELECT LOWER("title") as "text", "tokenID"
FROM "public"."TokenMapping"
INNER JOIN "Sign" on "id" = "signID"
WHERE "setID" = '1'

UNION ALL

SELECT LOWER("tensePast") as "text", "tokenID"
FROM "public"."Sign"
INNER JOIN "public"."TokenMapping" ON "signID" = "id" and "setID" = '1'
WHERE "isVerb" and "tensePast" != ''

UNION ALL

SELECT LOWER("tenseCurrent") as "text", "tokenID"
FROM "public"."Sign"
INNER JOIN "public"."TokenMapping" ON "signID" = "id" and "setID" = '1'
WHERE "isVerb" and "tenseCurrent" != ''

UNION ALL

SELECT LOWER("tenseFuture") as "text", "tokenID"
FROM "public"."Sign"
INNER JOIN "public"."TokenMapping" ON "signID" = "id" and "setID" = '1'
WHERE "isVerb" and "tenseFuture" != ''

Order By "tokenID", "text";