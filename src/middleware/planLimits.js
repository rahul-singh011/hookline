
const planLimits = async (req, res, next)=>{
    const { monthlyUsage, monthlyLimit, plan } = req.project

    if(monthlyUsage>= monthlyLimit){
        return res.status(429).json({
            error: 'Monthly event limit reached. Please upgrade plan.',
            plan,
            used: monthlyUsage,
            limit: monthlyLimit,
            upgradeUrl: `${process.env.CLIENT_URL}/billing/upgrade`,
        })
    }
    next()
}

export default planLimits