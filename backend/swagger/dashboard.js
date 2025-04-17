/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary data (admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     metrics:
 *                       type: object
 *                     recentOrders:
 *                       type: array
 *                     recentUsers:
 *                       type: array
 *                     orderStatusBreakdown:
 *                       type: array
 *                     dailyRevenue:
 *                       type: array
 *       401:
 *         description: Not authorized
 */
