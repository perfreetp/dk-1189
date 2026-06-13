import { Router } from 'express';
import packingListController from '../controllers/packingListController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/generate', packingListController.generateList.bind(packingListController));
router.get('/', packingListController.getAllLists.bind(packingListController));
router.get('/shared', packingListController.getSharedLists.bind(packingListController));

router.get('/:id', packingListController.getListById.bind(packingListController));
router.put('/:id', packingListController.updateList.bind(packingListController));
router.delete('/:id', packingListController.deleteList.bind(packingListController));

router.post('/:id/items', packingListController.addItem.bind(packingListController));
router.put('/:id/items/:itemId', packingListController.updateItem.bind(packingListController));
router.delete('/:id/items/:itemId', packingListController.deleteItem.bind(packingListController));

router.get('/:id/analysis', packingListController.getAnalysis.bind(packingListController));
router.get('/:id/weight-estimate', packingListController.getWeightEstimate.bind(packingListController));
router.get('/:id/risks', packingListController.getRisks.bind(packingListController));
router.get('/:id/shopping-list', packingListController.getShoppingList.bind(packingListController));
router.get('/:id/return-list', packingListController.getReturnPackingList.bind(packingListController));
router.get('/:id/airline-tips', packingListController.getAirlineTips.bind(packingListController));

router.get('/:id/reminders/documents', packingListController.getDocumentReminders.bind(packingListController));
router.get('/:id/reminders/liquids', packingListController.getLiquidReminders.bind(packingListController));

router.post('/:id/documents', packingListController.updateDocumentExpiry.bind(packingListController));

router.get('/:id/permission', packingListController.getPermission.bind(packingListController));

router.post('/:id/share', packingListController.shareList.bind(packingListController));
router.delete('/shared/:shareId', packingListController.unshareList.bind(packingListController));

router.post('/:id/reuse', packingListController.reuseList.bind(packingListController));

export default router;
