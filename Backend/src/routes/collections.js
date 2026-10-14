const express = require('express');
const supabase = require('../config/supabase');
const requireAuth = require('../middleware');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id,name,description,color,user_id,created_at,updated_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Could not fetch collections' });
    }

    return res.json({ collections: data || [] });
  } catch (error) {
    return res.status(500).json({ error: 'Could not fetch collections' });
  }
});

router.post('/', async (req, res) => {
  const { name, description, color } = req.body || {};

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({
      error: 'Name must be between 1 and 100 characters',
    });
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string or null' });
  }

  if (color !== undefined && color !== null && (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color))) {
    return res.status(400).json({
      error: 'Color must be a six-digit hex value, such as #8B5CF6',
    });
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: req.userId,
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : null,
        color: typeof color === 'string' ? color : '#8B5CF6',
      })
      .select('id,name,description,color,user_id,created_at,updated_at')
      .single();

    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A collection with that name already exists' });
    }

    if (error) {
      return res.status(500).json({ error: 'Could not create collection' });
    }

    return res.status(201).json({ collection: data });
  } catch {
    return res.status(500).json({ error: 'Could not create collection' });
  }
});

router.patch('/:id', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid collection id' });
  }

  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Provide collection fields to update' });
  }

  const allowedFields = ['name', 'description', 'color'];
  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    return res.status(400).json({ error: 'Only name, description, and color can be updated' });
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
    }
    updates.name = body.name.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (body.description !== null && typeof body.description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string or null' });
    }
    updates.description = typeof body.description === 'string' ? body.description.trim() : null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'color')) {
    if (typeof body.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(body.color)) {
      return res.status(400).json({
        error: 'Color must be a six-digit hex value, such as #8B5CF6',
      });
    }
    updates.color = body.color;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  updates.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('id,name,description,color,user_id,created_at,updated_at')
      .maybeSingle();

    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A collection with that name already exists' });
    }

    if (error) {
      return res.status(500).json({ error: 'Could not update collection' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    return res.json({ collection: data });
  } catch {
    return res.status(500).json({ error: 'Could not update collection' });
  }
});

router.delete('/:id', async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid collection id' });
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Could not delete collection' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    return res.json({ message: 'Collection deleted' });
  } catch {
    return res.status(500).json({ error: 'Could not delete collection' });
  }
});

module.exports = router;
