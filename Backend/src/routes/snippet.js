const express = require('express');
const supabase = require('../config/supabase');
const requireAuth = require('../middleware');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  const normalized = tags
    .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase().replace(/^#/, '') : ''))
    .filter(Boolean);

  return [...new Set(normalized)].slice(0, 20);
}

async function validateCollectionOwnership(collectionId, userId) {
  if (!collectionId) return null;
  if (!UUID_PATTERN.test(collectionId)) {
    return { status: 400, error: 'Invalid collection id' };
  }

  const { data, error } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { status: 500, error: 'Could not validate collection' };
  if (!data) return { status: 404, error: 'Collection not found' };
  return null;
}

router.get('/public/:id', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid snippet id' });
  }

  try {
    const { data, error } = await supabase
      .from('snippets')
      .select('id,title,code,language,description,tags,created_at,updated_at')
      .eq('id', req.params.id)
      .eq('is_public', true)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Could not fetch shared snippet' });
    }
    if (!data) {
      return res.status(404).json({ error: 'Shared snippet not found' });
    }

    return res.json({ snippet: data });
  } catch (error) {
    return res.status(500).json({ error: 'Could not fetch shared snippet' });
  }
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Could not fetch snippets' });
    }

    return res.json({ snippets: data || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Could not fetch snippets' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({ error: 'Invalid snippet id' });
  }

  try {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error?.code === 'PGRST116' || !data) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    if (error) {
      return res.status(500).json({ error: 'Could not fetch snippet' });
    }

    return res.json({ snippet: data });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { title, code, content, language, description, tags, is_favorite, is_public, collection_id } = req.body || {};

  if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
    return res.status(400).json({ error: 'Title is required and must be under 200 chars' });
  }

  const snippetCode = typeof code === 'string' ? code : typeof content === 'string' ? content : null;
  if (snippetCode === null) {
    return res.status(400).json({ error: 'Code must be a string' });
  }

  if (language !== undefined && language !== null && (typeof language !== 'string' || !language.trim())) {
    return res.status(400).json({ error: 'Language must be a non-empty string or null' });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string or null' });
  }

  if (tags !== undefined && tags !== null && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array or null' });
  }

  if (is_favorite !== undefined && is_favorite !== null && typeof is_favorite !== 'boolean') {
    return res.status(400).json({ error: 'is_favorite must be a boolean or null' });
  }

  if (is_public !== undefined && is_public !== null && typeof is_public !== 'boolean') {
    return res.status(400).json({ error: 'is_public must be a boolean or null' });
  }

  if (collection_id !== undefined && collection_id !== null && typeof collection_id !== 'string') {
    return res.status(400).json({ error: 'Collection id must be a string or null' });
  }

  try {
    const collectionError = await validateCollectionOwnership(collection_id, req.userId);
    if (collectionError) {
      return res.status(collectionError.status).json({ error: collectionError.error });
    }

    const { data, error } = await supabase
      .from('snippets')
      .insert({
        user_id: req.userId,
        title: title.trim(),
        code: snippetCode,
        description: typeof description === 'string' ? description.trim() : null,
        tags: normalizeTags(tags),
        language: typeof language === 'string' && language.trim() ? language.trim() : null,
        is_favorite: Boolean(is_favorite),
        is_public: Boolean(is_public),
        collection_id: collection_id || null,
      })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Could not create snippet' });
    }

    return res.status(201).json({ snippet: data });
  } catch (error) {
    return res.status(500).json({ error: 'Could not create snippet' });
  }
});

router.patch('/:id', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid snippet id' });
  }

  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Provide snippet fields to update' });
  }

  const allowedFields = ['title', 'code', 'content', 'language', 'description', 'tags', 'is_public', 'is_favorite', 'collection_id'];
  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    return res.status(400).json({ error: 'Only supported snippet fields can be updated' });
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 200) {
      return res.status(400).json({ error: 'Title must be between 1 and 200 characters' });
    }
    updates.title = body.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'code') || Object.prototype.hasOwnProperty.call(body, 'content')) {
    const nextCode = typeof body.code === 'string' ? body.code : typeof body.content === 'string' ? body.content : null;
    if (nextCode === null) {
      return res.status(400).json({ error: 'Code must be a string' });
    }
    updates.code = nextCode;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'language')) {
    if (body.language !== null && (typeof body.language !== 'string' || !body.language.trim())) {
      return res.status(400).json({ error: 'Language must be a string or null' });
    }
    updates.language = body.language === '' ? null : body.language;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (body.description !== null && typeof body.description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string or null' });
    }
    updates.description = typeof body.description === 'string' ? body.description.trim() : null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'tags')) {
    if (body.tags !== null && !Array.isArray(body.tags)) {
      return res.status(400).json({ error: 'Tags must be an array or null' });
    }
    updates.tags = normalizeTags(body.tags || []);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_favorite')) {
    if (typeof body.is_favorite !== 'boolean') {
      return res.status(400).json({ error: 'is_favorite must be a boolean' });
    }
    updates.is_favorite = body.is_favorite;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_public')) {
    if (typeof body.is_public !== 'boolean') {
      return res.status(400).json({ error: 'is_public must be a boolean' });
    }
    updates.is_public = body.is_public;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'collection_id')) {
    if (body.collection_id !== null && typeof body.collection_id !== 'string') {
      return res.status(400).json({ error: 'Collection id must be a string or null' });
    }
    updates.collection_id = body.collection_id || null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  updates.updated_at = new Date().toISOString();

  try {
    const collectionError = await validateCollectionOwnership(updates.collection_id, req.userId);
    if (collectionError) {
      return res.status(collectionError.status).json({ error: collectionError.error });
    }

    const { data, error } = await supabase
      .from('snippets')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Could not update snippet' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    return res.json({ snippet: data });
  } catch (error) {
    return res.status(500).json({ error: 'Could not update snippet' });
  }
});

router.delete('/:id', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid snippet id' });
  }

  try {
    const { data, error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Could not delete snippet' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    return res.json({ message: 'Snippet deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Could not delete snippet' });
  }
});

module.exports = router;