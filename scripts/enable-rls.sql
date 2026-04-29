-- Enable Row-Level Security on every Prisma-managed table.
-- Effect: blocks all access via Supabase's anon/authenticated REST API.
-- Prisma keeps working because it uses the service-role connection,
-- which is configured to bypass RLS.
--
-- Run this once in Supabase → SQL Editor → New query → Run.

ALTER TABLE "User"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Generation"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppSetting"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Avatar"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AvatarCategory"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhotoshootTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PhotoshootCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TryonModel"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductAdAvatar"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Voice"              ENABLE ROW LEVEL SECURITY;
