-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Allow users to view other profiles for community features
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Carbon activities policies
CREATE POLICY "carbon_activities_select_own" ON public.carbon_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "carbon_activities_insert_own" ON public.carbon_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carbon_activities_update_own" ON public.carbon_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "carbon_activities_delete_own" ON public.carbon_activities FOR DELETE USING (auth.uid() = user_id);

-- Carbon goals policies
CREATE POLICY "carbon_goals_select_own" ON public.carbon_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "carbon_goals_insert_own" ON public.carbon_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carbon_goals_update_own" ON public.carbon_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "carbon_goals_delete_own" ON public.carbon_goals FOR DELETE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "community_posts_select_all" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "community_posts_insert_own" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_posts_update_own" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_posts_delete_own" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community comments policies
CREATE POLICY "community_comments_select_all" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "community_comments_insert_own" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_comments_update_own" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "community_comments_delete_own" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);

-- Community likes policies
CREATE POLICY "community_likes_select_all" ON public.community_likes FOR SELECT USING (true);
CREATE POLICY "community_likes_insert_own" ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_likes_delete_own" ON public.community_likes FOR DELETE USING (auth.uid() = user_id);

-- Game achievements policies
CREATE POLICY "game_achievements_select_own" ON public.game_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "game_achievements_insert_own" ON public.game_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow viewing others' achievements for leaderboard
CREATE POLICY "game_achievements_select_public" ON public.game_achievements FOR SELECT USING (true);

-- Leaderboard policies
CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_insert_own" ON public.leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leaderboard_update_own" ON public.leaderboard FOR UPDATE USING (auth.uid() = user_id);
