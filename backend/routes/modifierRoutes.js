import express from 'express';
import {
  getMealModifiers, postGroup, linkGroupToMeal,
  postOption, removeOption
} from '../controllers/modifierController.js';

const r = express.Router();
r.get   ('/meals/:mealId',                     getMealModifiers);
r.post  ('/restaurants/:restaurantId/groups',  postGroup);
r.post  ('/meals/:mealId/groups/:groupId',     linkGroupToMeal);
r.post  ('/groups/:groupId/options',           postOption);
r.delete('/options/:optionId',                 removeOption);

export default r;
