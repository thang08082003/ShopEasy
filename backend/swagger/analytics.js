/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics (admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *         description: Time period for analytics
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of periods to return
 *     responses:
 *       200:
 *         description: Sales analytics data
 *       401:
 *         description: Not authorized
 * 
 * /api/analytics/users:
 *   get:
 *     summary: Get user analytics (admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics data
 *       401:
 *         description: Not authorized
 * 
 * /api/analytics/inventory:
 *   get:
 *     summary: Get inventory analytics (admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory analytics data
 *       401:
 *         description: Not authorized
 */
