using Auth_API.Models;
using Auth_API.Models.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Auth_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> UserManager;
        private readonly RoleManager<IdentityRole> RoleManager;
        private readonly IConfiguration _configuration;

        // Constructor
        public AuthenticateController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
        {
            this.UserManager = userManager;
            this.RoleManager = roleManager;
            _configuration = configuration;
        }

        // http request methods
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model) {

            var UserModel = await UserManager.FindByEmailAsync(model.Email);
            if (UserModel != null && await UserManager.CheckPasswordAsync(UserModel, model.Password))
            {

                var RawToken = await GetAccessToken(UserModel);

                var RawRefreshToken = GetRefreshToken(UserModel);

                // First we store the refresh token
                var refreshToken = new JwtSecurityTokenHandler().WriteToken(RawRefreshToken);

                if (!(await UserManager.SetAuthenticationTokenAsync(UserModel, "ASP Net Core", "Refresh", refreshToken)).Succeeded)
                    return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Refresh Token could not be created" });

                // Add refresh token to the response as cookie
                Response.Cookies.Append("refreshToken", refreshToken, GetSecureCookieOptions());

                return Ok(new
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(RawToken),
                });
            }
            return StatusCode(StatusCodes.Status401Unauthorized, new Response {Status = "Error", Message = "Bad email or password, please try again."});
        }

        [HttpPost]
        [Route("signup")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var UserExists = await UserManager.FindByNameAsync(model.Username);
            if (UserExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists!" });

            ApplicationUser UserModel = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };

            var Result = await UserManager.CreateAsync(UserModel, model.Password);

            if (!Result.Succeeded)

                return BadRequest(new {
                    Errors = Result.Errors.Select(e => new { e.Code, e.Description })
                });

            return Ok(new Response { Status = "Success", Message = "User created successfully!" });
        }

        [HttpPost]
        [Route("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterModel model)
        {
            var UserExists = await UserManager.FindByNameAsync(model.Username);
            if (UserExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists!" });

            var user = new ApplicationUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };

            var result = await UserManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Please check user details and try again." });

            if (!await RoleManager.RoleExistsAsync(UserRoles.Admin))
                await RoleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
            if (!await RoleManager.RoleExistsAsync(UserRoles.User))
                await RoleManager.CreateAsync(new IdentityRole(UserRoles.User));

            if (await RoleManager.RoleExistsAsync(UserRoles.Admin))
            {
                await UserManager.AddToRoleAsync(user, UserRoles.Admin);
            }

            return Ok(new Response { Status = "Success", Message = "User created successfully!" });
        }

        [Authorize]
        [HttpPost]
        [Route("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var UserId = User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;

            if (string.IsNullOrEmpty(UserId)) return StatusCode(StatusCodes.Status401Unauthorized);

            var UserModel = await UserManager.FindByIdAsync(UserId);

            if (UserModel == null) return StatusCode(StatusCodes.Status500InternalServerError);

            var RefreshToken = await UserManager.GetAuthenticationTokenAsync(UserModel, "ASP Net Core", "refresh");

            if (string.IsNullOrEmpty(RefreshToken)) return StatusCode(StatusCodes.Status401Unauthorized);

            var CookieRefreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(CookieRefreshToken) || RefreshToken != CookieRefreshToken) return StatusCode(StatusCodes.Status401Unauthorized);

            // Generates a new access and refresh token

            var RawToken = await GetAccessToken(UserModel);

            var RawRefreshToken = GetRefreshToken(UserModel);

            // First we store the refresh token
            var NewRefreshToken = new JwtSecurityTokenHandler().WriteToken(RawRefreshToken);

            if (!(await UserManager.SetAuthenticationTokenAsync(UserModel, "ASP Net Core", "Refresh", NewRefreshToken)).Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Refresh Token could not be created" });

            // Add refresh token to the response as cookie
            Response.Cookies.Append("refreshToken", NewRefreshToken, GetSecureCookieOptions());

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(RawToken),
            });

        }

        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> Logout([FromBody] string id) {

            var UserModel = await UserManager.FindByIdAsync(id);

            if(UserModel == null) return StatusCode(StatusCodes.Status500InternalServerError);

            if(!(await UserManager.RemoveAuthenticationTokenAsync(UserModel, "ASP Net Core", "refreshToken")).Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response {
                    Status = "Error",
                    Message = "Refresh Token could not have been removed"
                    });

            Response.Cookies.Delete("refreshToken");
            
            return StatusCode(StatusCodes.Status200OK);
        }

        private async Task<JwtSecurityToken> GetAccessToken(ApplicationUser user)
        {
            // Access token
            var AuthSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));

            var UserRoles = await UserManager.GetRolesAsync(user);

            var AuthClaims = new List<Claim>
                {
                    new("id", user.Id),
                    new(JwtRegisteredClaimNames.Name, user.UserName!),
                    new(JwtRegisteredClaimNames.Email, user.Email!),
                    new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

            foreach (var UserRole in UserRoles)
            {
                AuthClaims.Add(new Claim(ClaimTypes.Role, UserRole));
            }
            return new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.UtcNow.AddHours(1),
                claims: AuthClaims,
                signingCredentials: new SigningCredentials(AuthSigningKey, SecurityAlgorithms.HmacSha256)
                );
        }

        private JwtSecurityToken GetRefreshToken(ApplicationUser user)
        {
            var AuthSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));

            return new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                claims: [
                    new Claim(JwtRegisteredClaimNames.Sid, user.Id),
                ],
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: new SigningCredentials(AuthSigningKey, SecurityAlgorithms.HmacSha256)
                );

        }

        private CookieOptions GetSecureCookieOptions() => new CookieOptions {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddHours(3),
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                };


        //private string createRefreshToken()
        //{
        //    // RandomNumberGenerator rng = RandomNumberGenerator.Create();
        //    var rng = RandomNumberGenerator.Create();

        //    byte[] randomNumber = new byte[32];

        //    rng.GetBytes(randomNumber);

        //    return ByteToHex(randomNumber);
        //}


        //private string ByteToHex(byte[] bytes)
        //{
        //    StringBuilder hex = new StringBuilder(bytes.Length * 2);

        //    foreach (byte b in bytes)
        //        hex.AppendFormat("{0:x2}", b);

        //    return hex.ToString();
        //}

    }// Class
}// namespace
