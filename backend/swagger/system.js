/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Check API health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: string
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                 server:
 *                   type: object
 * 
 * /api/system/info:
 *   get:
 *     summary: Get detailed system information (admin)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed system information
 *       401:
 *         description: Not authorized
 */
