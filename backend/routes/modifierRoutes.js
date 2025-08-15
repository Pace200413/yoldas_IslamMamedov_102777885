import express from 'express';
import {
  getMealModifiers,
  listGroups,
  postGroup,
  patchGroup,
  removeGroup,
  linkGroupToMeal,
  unlinkGroupFromMeal,
  postOption,
  patchOption,
  removeOption,
} from '../controllers/modifierController.js';

const router = express.Router();

/* ── Query ──────────────────────────────────────────────── */
router.get('/meals/:mealId', getMealModifiers);
router.get('/restaurants/:restaurantId/groups', listGroups);

/* ── Groups ─────────────────────────────────────────────── */
router.post('/restaurants/:restaurantId/groups', postGroup);
router.patch('/groups/:groupId', patchGroup);
router.delete('/groups/:groupId', removeGroup);

/* ── Link/unlink groups to meals ────────────────────────── */
router.post('/meals/:mealId/groups/:groupId', linkGroupToMeal);
router.delete('/meals/:mealId/groups/:groupId', unlinkGroupFromMeal);

/* ── Options ────────────────────────────────────────────── */
router.post('/groups/:groupId/options', postOption);
router.patch('/options/:optionId', patchOption);
router.delete('/options/:optionId', removeOption);

export default router;
