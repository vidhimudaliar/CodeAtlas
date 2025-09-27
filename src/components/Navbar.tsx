import Image from "next/image";
// <Link to="SignUp" className='nav-link'>Sign Up</Link>

export default function Navbar () {
    return (
        <nav className='navbar'>
          <div className='logo'>
            <Image src="/thelogo.png" alt="logo" width={327} height={72} className="logo-img"/>
          </div>
    
    
    
          <div className="nav-links">
    
        
            
          </div>
        </nav>
      )
}