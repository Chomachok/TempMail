using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TempMail.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Emails",
                columns: table => new
                {
                    EmailId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Address = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DiesAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Alive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Emails", x => x.EmailId);
                    table.ForeignKey(
                        name: "FK_Emails_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Letters",
                columns: table => new
                {
                    LetterId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MailId = table.Column<int>(type: "integer", nullable: false),
                    FromAddress = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    BodyHtml = table.Column<string>(type: "text", nullable: true),
                    Time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Letters", x => x.LetterId);
                    table.ForeignKey(
                        name: "FK_Letters_Emails_MailId",
                        column: x => x.MailId,
                        principalTable: "Emails",
                        principalColumn: "EmailId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Emails_Address",
                table: "Emails",
                column: "Address",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Emails_UserId",
                table: "Emails",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Letters_MailId",
                table: "Letters",
                column: "MailId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_SessionId",
                table: "Users",
                column: "SessionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Letters");

            migrationBuilder.DropTable(
                name: "Emails");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
