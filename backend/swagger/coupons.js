/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons (admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       code:
 *                         type: string
 *                       discountType:
 *                         type: string
 *                       discountAmount:
 *                         type: number
 *                       isActive:
 *                         type: boolean
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authorized
 *   
 *   post:
 *     summary: Create a new coupon (admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - description
 *               - discountType
 *               - discountAmount
 *               - startDate
 *               - endDate
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountAmount:
 *                 type: number
 *               minPurchase:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               usageLimit:
 *                 type: number
 *               appliedCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               appliedProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 * 
 * /api/coupons/{id}:
 *   get:
 *     summary: Get a single coupon (admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Coupon not found
 *   
 *   put:
 *     summary: Update a coupon (admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountAmount:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Coupon not found
 *   
 *   delete:
 *     summary: Delete a coupon (admin)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon ID
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Coupon not found
 *
 * /api/coupons/apply:
 *   post:
 *     summary: Apply coupon to cart
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon or cart is empty
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Coupon not found
 *
 * /api/coupons/remove:
 *   delete:
 *     summary: Remove coupon from cart
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 *       401:
 *         description: Not authorized
 */
