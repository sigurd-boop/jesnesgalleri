using System;
using Galleri.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace Galleri.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.4");

            modelBuilder.Entity("Galleri.Api.Models.Artwork", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Category")
                        .HasMaxLength(64)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("collection");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(4000)
                        .HasColumnType("TEXT");

                    b.Property<int?>("DisplayOrder")
                        .HasColumnType("INTEGER");

                    b.Property<string>("GalleryShotStoragePaths")
                        .HasColumnType("TEXT");

                    b.Property<string>("GalleryShots")
                        .HasColumnType("TEXT");

                    b.Property<string>("ImageStoragePath")
                        .HasMaxLength(512)
                        .HasColumnType("TEXT");

                    b.Property<string>("ImageUrl")
                        .HasMaxLength(2048)
                        .HasColumnType("TEXT");

                    b.Property<string>("ModelPath")
                        .HasMaxLength(512)
                        .HasColumnType("TEXT")
                        .HasDefaultValue("/models/textured.glb");

                    b.Property<string>("PostedAt")
                        .HasMaxLength(64)
                        .HasColumnType("TEXT");

                    b.Property<string>("Tags")
                        .HasColumnType("TEXT");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("TEXT");

                    b.Property<DateTime?>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.HasKey("Id");

                    b.ToTable("Artworks");
                });
#pragma warning restore 612, 618
        }
    }
}
