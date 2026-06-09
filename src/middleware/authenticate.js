
import Project from '../models/Project.js'


const authenticate = async (req, res, next)=>{
    try{
        const authHeader = req.headers['authorization']

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({
                error: 'Missing API key. Use Authorization : Bearer <your_api_key> '
            })
        }

        const apiKey = authHeader.split(' ')[1]

        const project = await Project.findOne({apiKey , isActive: true})

        if(!project){
            return res.status(401).json({error: 'Invalid or inactive api key'})
        }

        req.project = project

        next()
    } catch(err){
        next(err)
    }
}

export default authenticate