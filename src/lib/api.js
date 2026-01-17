import { supabase } from './supabase';

const generateSlug = (title) => {
  let slug = title.toLowerCase();
  slug = slug.replace(/[áàäâ]/g, 'a');
  slug = slug.replace(/[éèëê]/g, 'e');
  slug = slug.replace(/[íìïî]/g, 'i');
  slug = slug.replace(/[óòöô]/g, 'o');
  slug = slug.replace(/[úùüû]/g, 'u');
  slug = slug.replace(/[ñ]/g, 'n');
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s_]+/g, '-');
  slug = slug.replace(/-+/g, '-');
  return slug.replace(/^-+|-+$/g, '');
};

const hashPassword = async (password) => {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const authApi = {
  login: async (username, password, rememberMe = false) => {
    try {
      const passwordHash = await hashPassword(password);

      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .maybeSingle();

      if (error) throw error;
      if (!user) throw new Error('Credenciales inválidas');

      const token = btoa(JSON.stringify({ username, timestamp: Date.now() }));

      const { error: attemptError } = await supabase
        .from('login_attempts')
        .insert({ username, success: true, timestamp: new Date().toISOString() });

      return { data: { token, expires_at: new Date(Date.now() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString() } };
    } catch (error) {
      await supabase
        .from('login_attempts')
        .insert({ username, success: false, timestamp: new Date().toISOString() });

      throw error;
    }
  },

  verify: async () => {
    const token = localStorage.getItem('moonlightbl_token');
    if (!token) throw new Error('No token');

    try {
      const decoded = JSON.parse(atob(token));
      return { valid: true, username: decoded.username };
    } catch {
      throw new Error('Invalid token');
    }
  },
};

export const publicApi = {
  getContents: async (params = {}) => {
    let query = supabase
      .from('contents')
      .select('*')
      .eq('status', params.status || 'published');

    if (params.content_type) query = query.eq('content_type', params.content_type);
    if (params.genre) query = query.contains('genres', [params.genre]);
    if (params.year) query = query.eq('year', params.year);
    if (params.country) query = query.eq('country', params.country);
    if (params.is_featured !== undefined) query = query.eq('is_featured', params.is_featured);
    if (params.is_trending !== undefined) query = query.eq('is_trending', params.is_trending);
    if (params.is_popular !== undefined) query = query.eq('is_popular', params.is_popular);

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,synopsis.ilike.%${params.search}%`);
    }

    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending: sortOrder });

    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 20) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },

  getContentBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Contenido no encontrado');
    return { data };
  },

  getContentSeasons: async (slug) => {
    const { data: content } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!content) throw new Error('Contenido no encontrado');

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('content_id', content.id)
      .eq('status', 'published')
      .order('number');

    if (error) throw error;
    return { data };
  },

  getSeasonBySlug: async (slug, seasonSlug) => {
    const { data: content } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!content) throw new Error('Contenido no encontrado');

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('content_id', content.id)
      .eq('slug', seasonSlug)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Temporada no encontrada');
    return { data };
  },

  getSeasonEpisodes: async (slug, seasonSlug) => {
    const { data: content } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!content) throw new Error('Contenido no encontrado');

    const { data: season } = await supabase
      .from('seasons')
      .select('id')
      .eq('content_id', content.id)
      .eq('slug', seasonSlug)
      .maybeSingle();

    if (!season) throw new Error('Temporada no encontrada');

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', season.id)
      .eq('status', 'published')
      .order('number');

    if (error) throw error;
    return { data };
  },

  getEpisodeBySlug: async (slug, seasonSlug, episodeSlug) => {
    const { data: content } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!content) throw new Error('Contenido no encontrado');

    const { data: season } = await supabase
      .from('seasons')
      .select('id')
      .eq('content_id', content.id)
      .eq('slug', seasonSlug)
      .maybeSingle();

    if (!season) throw new Error('Temporada no encontrada');

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', season.id)
      .eq('slug', episodeSlug)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Episodio no encontrado');

    await supabase.from('view_stats').insert({
      content_id: content.id,
      episode_id: data.id,
      timestamp: new Date().toISOString()
    });

    await supabase.rpc('increment_views', { row_id: data.id, table_name: 'episodes' });
    await supabase.rpc('increment_views', { row_id: content.id, table_name: 'contents' });

    return { data };
  },

  getCarousel: async () => {
    const { data: config } = await supabase
      .from('carousel_config')
      .select('*')
      .maybeSingle();

    if (config && config.items && config.items.length > 0) {
      const contentIds = config.items.map(item => item.content_id);
      const { data: contents } = await supabase
        .from('contents')
        .select('*')
        .in('id', contentIds)
        .eq('status', 'published');

      const ordered = config.items
        .map(item => contents.find(c => c.id === item.content_id))
        .filter(Boolean);

      return { data: ordered };
    }

    const autoType = config?.auto_type || 'popular';
    let query = supabase.from('contents').select('*').eq('status', 'published');

    if (autoType === 'popular') {
      query = query.eq('is_popular', true).order('views', { ascending: false });
    } else if (autoType === 'trending') {
      query = query.eq('is_trending', true).order('views', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(10);
    return { data: data || [] };
  },

  getGenres: async () => {
    const { data } = await supabase
      .from('contents')
      .select('genres')
      .eq('status', 'published');

    const genresSet = new Set();
    data?.forEach(item => {
      item.genres?.forEach(genre => genresSet.add(genre));
    });

    return { data: Array.from(genresSet).sort() };
  },

  getCountries: async () => {
    const { data } = await supabase
      .from('contents')
      .select('country')
      .eq('status', 'published')
      .not('country', 'is', null);

    const countriesSet = new Set(data?.map(item => item.country).filter(Boolean));
    return { data: Array.from(countriesSet).sort() };
  },

  recordView: async (contentId) => {
    await supabase.from('view_stats').insert({
      content_id: contentId,
      timestamp: new Date().toISOString()
    });

    const { data: content } = await supabase
      .from('contents')
      .select('views')
      .eq('id', contentId)
      .maybeSingle();

    if (content) {
      await supabase
        .from('contents')
        .update({ views: (content.views || 0) + 1 })
        .eq('id', contentId);
    }

    return { data: { success: true } };
  },

  submitContact: async (data) => {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
    return { data: { success: true, message: 'Mensaje enviado correctamente' } };
  },
};

export const adminApi = {
  getContents: async (params = {}) => {
    let query = supabase.from('contents').select('*');

    if (params.content_type) query = query.eq('content_type', params.content_type);
    if (params.status) query = query.eq('status', params.status);
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,tmdb_id.eq.${params.search},imdb_id.eq.${params.search}`);
    }

    query = query.order('updated_at', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },

  getContent: async (id) => {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Contenido no encontrado');
    return { data };
  },

  createContent: async (content) => {
    if (!content.slug) {
      content.slug = generateSlug(content.title);
    }

    const { data: existing } = await supabase
      .from('contents')
      .select('id')
      .eq('slug', content.slug)
      .maybeSingle();

    if (existing) {
      content.slug = `${content.slug}-${Date.now()}`;
    }

    const { data, error } = await supabase
      .from('contents')
      .insert({
        ...content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      action: 'create',
      entity_type: 'content',
      entity_id: data.id,
      changes: { title: content.title },
      timestamp: new Date().toISOString()
    });

    return { data };
  },

  updateContent: async (id, updates) => {
    const { data, error } = await supabase
      .from('contents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      action: 'update',
      entity_type: 'content',
      entity_id: id,
      changes: updates,
      timestamp: new Date().toISOString()
    });

    return { data };
  },

  deleteContent: async (id) => {
    const { data: content } = await supabase
      .from('contents')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      action: 'delete',
      entity_type: 'content',
      entity_id: id,
      changes: { title: content?.title },
      timestamp: new Date().toISOString()
    });

    return { data: { success: true } };
  },

  getSeasons: async (contentId) => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('content_id', contentId)
      .order('number');

    if (error) throw error;
    return { data };
  },

  createSeason: async (contentId, season) => {
    if (!season.slug) {
      season.slug = generateSlug(season.title || `Temporada ${season.number}`);
    }

    const { data, error } = await supabase
      .from('seasons')
      .insert({
        ...season,
        content_id: contentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    const { data: content } = await supabase
      .from('contents')
      .select('season_count')
      .eq('id', contentId)
      .maybeSingle();

    if (content) {
      await supabase
        .from('contents')
        .update({ season_count: (content.season_count || 0) + 1 })
        .eq('id', contentId);
    }

    return { data };
  },

  getAllSeasons: async (params = {}) => {
    let query = supabase.from('seasons').select('*, contents(title, content_type, slug)');

    if (params.content_id) query = query.eq('content_id', params.content_id);
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,tmdb_id.eq.${params.search},imdb_id.eq.${params.search}`);
    }

    query = query.order('created_at', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;

    const formatted = data?.map(season => ({
      ...season,
      content_title: season.contents?.title || 'N/A',
      content_type: season.contents?.content_type || 'N/A',
      content_slug: season.contents?.slug || ''
    })) || [];

    return { data: formatted };
  },

  getSeason: async (seasonId) => {
    const { data, error } = await supabase
      .from('seasons')
      .select('*, contents(title, content_type, slug)')
      .eq('id', seasonId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Temporada no encontrada');

    return {
      data: {
        ...data,
        content_title: data.contents?.title || 'N/A',
        content_type: data.contents?.content_type || 'N/A',
        content_slug: data.contents?.slug || ''
      }
    };
  },

  updateSeason: async (seasonId, updates) => {
    const { data, error } = await supabase
      .from('seasons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', seasonId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  deleteSeason: async (seasonId) => {
    const { data: season } = await supabase
      .from('seasons')
      .select('content_id')
      .eq('id', seasonId)
      .maybeSingle();

    const { error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', seasonId);

    if (error) throw error;

    if (season) {
      const { data: content } = await supabase
        .from('contents')
        .select('season_count')
        .eq('id', season.content_id)
        .maybeSingle();

      if (content && content.season_count > 0) {
        await supabase
          .from('contents')
          .update({ season_count: content.season_count - 1 })
          .eq('id', season.content_id);
      }
    }

    return { data: { success: true } };
  },

  getEpisodes: async (seasonId) => {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('number');

    if (error) throw error;
    return { data };
  },

  createEpisode: async (seasonId, episode) => {
    if (!episode.slug) {
      episode.slug = generateSlug(episode.title);
    }

    const { data: season } = await supabase
      .from('seasons')
      .select('content_id')
      .eq('id', seasonId)
      .maybeSingle();

    if (!season) throw new Error('Temporada no encontrada');

    const { data, error } = await supabase
      .from('episodes')
      .insert({
        ...episode,
        season_id: seasonId,
        content_id: season.content_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    const { data: seasonData } = await supabase
      .from('seasons')
      .select('episode_count')
      .eq('id', seasonId)
      .maybeSingle();

    if (seasonData) {
      await supabase
        .from('seasons')
        .update({ episode_count: (seasonData.episode_count || 0) + 1 })
        .eq('id', seasonId);
    }

    return { data };
  },

  getAllEpisodes: async (params = {}) => {
    let query = supabase.from('episodes').select(`
      *,
      seasons(number, title),
      contents(title, content_type, slug)
    `);

    if (params.season_id) query = query.eq('season_id', params.season_id);
    if (params.content_id) query = query.eq('content_id', params.content_id);
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,tmdb_id.eq.${params.search},imdb_id.eq.${params.search}`);
    }

    query = query.order('created_at', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;

    const formatted = data?.map(episode => ({
      ...episode,
      season_number: episode.seasons?.number || 0,
      season_title: episode.seasons?.title || '',
      content_title: episode.contents?.title || 'N/A',
      content_type: episode.contents?.content_type || 'N/A',
      content_slug: episode.contents?.slug || ''
    })) || [];

    return { data: formatted };
  },

  getEpisode: async (episodeId) => {
    const { data, error } = await supabase
      .from('episodes')
      .select(`
        *,
        seasons(number, title, slug),
        contents(title, content_type, slug)
      `)
      .eq('id', episodeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Episodio no encontrado');

    return {
      data: {
        ...data,
        season_number: data.seasons?.number || 0,
        season_title: data.seasons?.title || '',
        season_slug: data.seasons?.slug || '',
        content_title: data.contents?.title || 'N/A',
        content_type: data.contents?.content_type || 'N/A',
        content_slug: data.contents?.slug || ''
      }
    };
  },

  updateEpisode: async (episodeId, updates) => {
    const { data, error } = await supabase
      .from('episodes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },

  deleteEpisode: async (episodeId) => {
    const { data: episode } = await supabase
      .from('episodes')
      .select('season_id')
      .eq('id', episodeId)
      .maybeSingle();

    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId);

    if (error) throw error;

    if (episode) {
      const { data: season } = await supabase
        .from('seasons')
        .select('episode_count')
        .eq('id', episode.season_id)
        .maybeSingle();

      if (season && season.episode_count > 0) {
        await supabase
          .from('seasons')
          .update({ episode_count: season.episode_count - 1 })
          .eq('id', episode.season_id);
      }
    }

    return { data: { success: true } };
  },

  getCarouselConfig: async () => {
    const { data } = await supabase
      .from('carousel_config')
      .select('*')
      .maybeSingle();

    return {
      data: data || {
        items: [],
        auto_populate: true,
        auto_type: 'popular',
        updated_at: new Date().toISOString()
      }
    };
  },

  updateCarouselConfig: async (config) => {
    const { data: existing } = await supabase
      .from('carousel_config')
      .select('id')
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('carousel_config')
        .update({ ...config, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('carousel_config')
        .insert({ ...config, updated_at: new Date().toISOString() })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { data: result.data };
  },

  getStatsOverview: async () => {
    const [
      { count: total_contents },
      { count: published_contents },
      { count: pending_contents },
      { count: series_count },
      { count: miniseries_count },
      { count: movies_count },
      { count: anime_count },
      { count: total_seasons },
      { count: total_episodes },
      { count: total_views }
    ] = await Promise.all([
      supabase.from('contents').select('*', { count: 'exact', head: true }),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('content_type', 'serie'),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('content_type', 'miniserie'),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('content_type', 'pelicula'),
      supabase.from('contents').select('*', { count: 'exact', head: true }).eq('content_type', 'anime'),
      supabase.from('seasons').select('*', { count: 'exact', head: true }),
      supabase.from('episodes').select('*', { count: 'exact', head: true }),
      supabase.from('view_stats').select('*', { count: 'exact', head: true })
    ]);

    return {
      data: {
        total_contents: total_contents || 0,
        published_contents: published_contents || 0,
        pending_contents: pending_contents || 0,
        series_count: series_count || 0,
        miniseries_count: miniseries_count || 0,
        movies_count: movies_count || 0,
        anime_count: anime_count || 0,
        total_seasons: total_seasons || 0,
        total_episodes: total_episodes || 0,
        total_views: total_views || 0
      }
    };
  },

  getTopContents: async (params = {}) => {
    const { data, error } = await supabase
      .from('contents')
      .select('id, title, poster, views, content_type')
      .order('views', { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;
    return { data };
  },

  getViewsByPeriod: async (params = {}) => {
    const days = params.period === 'day' ? 1 : params.period === 'week' ? 7 : 30;
    const viewsData = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { count } = await supabase
        .from('view_stats')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', date.toISOString())
        .lt('timestamp', nextDate.toISOString());

      viewsData.push({ date: dateStr, views: count || 0 });
    }

    return { data: viewsData };
  },

  getAuditLogs: async (params = {}) => {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },

  getContactMessages: async (params = {}) => {
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (params.limit) query = query.limit(params.limit);
    if (params.skip) query = query.range(params.skip, params.skip + (params.limit || 50) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },

  markMessageRead: async (messageId) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
    return { data: { success: true } };
  },
};

export default { authApi, publicApi, adminApi };
